export interface StreamState {
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  error: string | null;
}

export interface TranscriptionItem {
  id: string;
  text: string;
  sender: 'user' | 'model';
  isComplete: boolean;
}

export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}