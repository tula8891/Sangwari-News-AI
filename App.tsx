import React, { useEffect, useRef, useState } from 'react';
import { useLiveSession } from './hooks/useLiveSession';
import { Avatar } from './components/Avatar';
import { Controls } from './components/Controls';
import { NewsFeed } from './components/NewsFeed';

const App: React.FC = () => {
  const { 
    state, 
    transcriptions, 
    groundingMetadata, 
    connect, 
    disconnect, 
    toggleMute 
  } = useLiveSession();
  
  // Default to Chhattisgarhi as per requirement
  const [selectedLanguage, setSelectedLanguage] = useState("Chhattisgarhi");
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const handleConnect = () => {
    connect(selectedLanguage);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-gray-100 overflow-hidden relative font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
               <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Sangwari News AI
              </h1>
              <p className="text-xs text-green-400">Live Chhattisgarh News Avatar</p>
            </div>
         </div>
         {state.isConnected && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-red-400">LIVE</span>
            </div>
         )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 p-4 z-10">
        
        {/* Left: Avatar & Controls */}
        <div className="flex flex-col items-center gap-8 flex-1">
          <Avatar 
            isSpeaking={state.isSpeaking} 
            volume={state.volume} 
            isConnected={state.isConnected}
          />
          
          <div className="w-full max-w-sm">
             <Controls 
               isConnected={state.isConnected}
               isConnecting={state.isConnecting}
               isMuted={state.isMuted}
               selectedLanguage={selectedLanguage}
               onLanguageChange={setSelectedLanguage}
               onConnect={handleConnect}
               onDisconnect={disconnect}
               onToggleMute={toggleMute}
             />
             {state.error && (
               <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm text-center">
                 {state.error}
               </div>
             )}
          </div>
        </div>

        {/* Right: Info & Transcript */}
        <div className={`flex flex-col gap-6 w-full md:w-96 transition-all duration-500 ${state.isConnected || state.isConnecting ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-10 pointer-events-none'}`}>
          
          {/* Transcript Box */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl h-64 flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm">
             <div className="p-3 border-b border-gray-700 bg-gray-800/80">
               <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Transcript</span>
             </div>
             <div 
               ref={transcriptContainerRef}
               className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide"
             >
                {transcriptions.length === 0 ? (
                  <p className="text-gray-500 text-sm italic text-center mt-10">
                    Ask me: "What is the latest news in Chhattisgarh?"
                  </p>
                ) : (
                  transcriptions.map((t) => (
                    <div key={t.id} className={`flex flex-col ${t.sender === 'user' ? 'items-end' : 'items-start'}`}>
                       <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                         t.sender === 'user' 
                           ? 'bg-blue-600/20 text-blue-100 rounded-br-none border border-blue-500/20' 
                           : 'bg-green-600/20 text-green-100 rounded-bl-none border border-green-500/20'
                       }`}>
                         {t.text}
                       </div>
                       <span className="text-[10px] text-gray-500 mt-1 px-1">
                         {t.sender === 'user' ? 'You' : 'Sangwari'}
                       </span>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* News Links */}
          <NewsFeed sources={groundingMetadata} />

        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full p-4 text-center text-xs text-gray-600 z-10">
         Powered by Gemini 2.5 Flash & Google Search Grounding
      </footer>
    </div>
  );
};

export default App;