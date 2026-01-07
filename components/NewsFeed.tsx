import React from 'react';
import { GroundingChunk } from '../types';

interface NewsFeedProps {
  sources: GroundingChunk[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ sources }) => {
  if (sources.length === 0) return null;

  return (
    <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700 max-w-md w-full">
      <h3 className="text-orange-400 text-sm font-semibold mb-3 uppercase tracking-wider flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        Sources & Links
      </h3>
      <ul className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
        {sources.map((chunk, index) => {
           if (!chunk.web) return null;
           return (
             <li key={index} className="text-sm">
                <a 
                  href={chunk.web.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-2 rounded hover:bg-gray-700 transition-colors text-blue-300 hover:text-blue-200 truncate"
                >
                  {chunk.web.title}
                </a>
             </li>
           );
        })}
      </ul>
    </div>
  );
};