import React from 'react';

interface GoldFrameProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

export function GoldFrame({ children, className = '', onClick }: GoldFrameProps) {
    return (
        <div className={`relative p-1 rounded-3xl bg-gradient-to-b from-yellow-600 via-yellow-200 to-yellow-700 shadow-2xl ${className}`} onClick={onClick}>
            {/* Inner Bevel */}
            <div className="bg-gradient-to-b from-yellow-800 via-yellow-500 to-yellow-900 rounded-[20px] p-1">
                {/* Pattern/Texture Layer (Optional) */}
                <div className="bg-[#1a0b2e] rounded-2xl border-2 border-yellow-600/50 shadow-inner relative overflow-hidden">
                    {/* Corner Decorations */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-yellow-500 rounded-tl-xl opacity-50" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-500 rounded-tr-xl opacity-50" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-500 rounded-bl-xl opacity-50" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-yellow-500 rounded-br-xl opacity-50" />

                    {children}
                </div>
            </div>
        </div>
    );
}
