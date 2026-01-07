import React from 'react';

interface ControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ 
  isConnected, 
  isConnecting,
  isMuted, 
  onConnect, 
  onDisconnect, 
  onToggleMute 
}) => {
  return (
    <div className="flex gap-4 items-center justify-center p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700 shadow-xl">
      {!isConnected ? (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform flex items-center gap-2 ${
            isConnecting 
              ? 'bg-gray-600 cursor-wait text-gray-300' 
              : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:shadow-green-500/20 hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            'Start Conversation'
          )}
        </button>
      ) : (
        <>
          <button
            onClick={onToggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            )}
          </button>
          
          <button
            onClick={onDisconnect}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-semibold shadow-lg transition-colors"
          >
            End Call
          </button>
        </>
      )}
    </div>
  );
};