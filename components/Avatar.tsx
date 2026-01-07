import React from 'react';

interface AvatarProps {
  isSpeaking: boolean;
  volume: number; // 0 to 1
  isConnected: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ isSpeaking, volume, isConnected }) => {
  // Base scale is 1, max scale adds 0.3 based on volume
  const scale = 1 + Math.min(volume * 5, 0.4); 
  const glowOpacity = Math.min(volume * 8, 0.8);

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96">
      {/* Outer Glow Ring */}
      <div 
        className="absolute rounded-full bg-green-500 blur-2xl transition-all duration-75 ease-out"
        style={{
          width: '100%',
          height: '100%',
          opacity: isConnected ? (isSpeaking ? glowOpacity : 0.1) : 0,
          transform: `scale(${scale * 1.1})`
        }}
      />
      
      {/* Middle Ring */}
      <div 
        className="absolute rounded-full border-4 border-orange-500/30 transition-all duration-300"
        style={{
           width: '110%',
           height: '110%',
           transform: `scale(${isConnected ? 1 : 0.9})`,
           opacity: isConnected ? 1 : 0.5
        }}
      />

      {/* Avatar Image Container */}
      <div 
        className="relative z-10 w-full h-full rounded-full overflow-hidden border-4 border-gray-800 shadow-2xl transition-transform duration-75 ease-out bg-gray-900"
        style={{ transform: `scale(${isSpeaking ? scale : 1})` }}
      >
         {/* Placeholder for an Indian News Anchor style avatar */}
         <img 
            src="https://picsum.photos/id/64/800/800" 
            alt="Sangwari Avatar" 
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
         />
         
         {!isConnected && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                 <span className="text-white font-semibold">Offline</span>
             </div>
         )}
      </div>
    </div>
  );
};