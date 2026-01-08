import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decode, decodeAudioData, calculateVolume } from '../utils/audio';
import { StreamState, TranscriptionItem, GroundingChunk } from '../types';

export const useLiveSession = () => {
  const [state, setState] = useState<StreamState>({
    isConnected: false,
    isConnecting: false,
    isSpeaking: false,
    isMuted: false,
    volume: 0,
    error: null,
  });

  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [groundingMetadata, setGroundingMetadata] = useState<GroundingChunk[]>([]);

  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const currentInputTransRef = useRef<string>('');
  const currentOutputTransRef = useRef<string>('');

  const disconnect = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        session.close();
      }).catch(() => {}); // Ignore errors if already closed
      sessionPromiseRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();

    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      isConnecting: false, 
      isSpeaking: false, 
      volume: 0 
    }));
  }, []);

  const connect = useCallback(async (language: string) => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Setup Audio Contexts
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;

      nextStartTimeRef.current = outputCtx.currentTime;

      // Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      scriptProcessor.onaudioprocess = (e) => {
        if (state.isMuted) return; // Don't send data if muted locally
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);
        
        if (sessionPromiseRef.current) {
          sessionPromiseRef.current.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are "Sangwari", a friendly, energetic, and knowledgeable news anchor for Chhattisgarh, India.
          
          CRITICAL INSTRUCTIONS:
          1. **Topic**: Your primary mission is to provide the latest news about **Chhattisgarh**.
          2. **Language**: Speak primarily in ${language}. If the user speaks English, you may reply in English but keep the persona.
          3. **Search**: When asked about news (especially Chhattisgarh news), **ALWAYS** use the Google Search tool to find the absolute latest updates from reliable sources.
          4. **Persona**: Act like a professional TV news anchor. Be energetic, polite, and clear.
          5. **Behavior**: If the user asks for "news", assume they mean Chhattisgarh news unless specified otherwise.
          
          Start the conversation by introducing yourself as Sangwari, the Chhattisgarh news anchor.`,
          tools: [{ googleSearch: {} }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log('Session opened');
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
               currentOutputTransRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
               currentInputTransRef.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
               const userText = currentInputTransRef.current;
               const modelText = currentOutputTransRef.current;
               
               if (userText) {
                 setTranscriptions(prev => [...prev, { id: Date.now().toString() + 'u', text: userText, sender: 'user', isComplete: true }]);
               }
               if (modelText) {
                 setTranscriptions(prev => [...prev, { id: Date.now().toString() + 'm', text: modelText, sender: 'model', isComplete: true }]);
               }

               currentInputTransRef.current = '';
               currentOutputTransRef.current = '';
            }

            // Handle Grounding (News Links)
            const grounding = (message as any).serverContent?.groundingMetadata;
            if (grounding && grounding.groundingChunks) {
                setGroundingMetadata(grounding.groundingChunks);
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputCtx) {
              const audioData = decode(base64Audio);
              
              // Calculate volume for animation
              const volume = calculateVolume(new Int16Array(audioData.buffer));
              setState(prev => ({ ...prev, volume, isSpeaking: true }));

              // Play Audio
              const buffer = await decodeAudioData(audioData, outputCtx, 24000, 1);
              
              // Schedule playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                   setState(prev => ({ ...prev, isSpeaking: false, volume: 0 }));
                }
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = outputCtx.currentTime;
              currentOutputTransRef.current = ''; 
              setState(prev => ({ ...prev, isSpeaking: false, volume: 0 }));
            }
          },
          onclose: () => {
             console.log('Session closed');
             disconnect();
          },
          onerror: (err) => {
            console.error(err);
            setState(prev => ({ ...prev, error: "Connection error detected." }));
            disconnect();
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;
      
      // Wait for session to actually establish
      await sessionPromise;
      setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));

    } catch (error: any) {
      console.error("Connection failed", error);
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isConnecting: false, 
        error: error.message 
      }));
    }
  }, [disconnect, state.isMuted]);

  const toggleMute = () => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  return {
    state,
    transcriptions,
    groundingMetadata,
    connect,
    disconnect,
    toggleMute
  };
};