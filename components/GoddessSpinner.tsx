import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GoddessSpinnerProps {
    size?: number;
    interval?: number;
}

const GODDESS_IMAGES = [
    '/images/cartoon_anubis.png',
    '/images/cartoon_pharaoh.png',
    '/images/cartoon_scarab.png',
    '/images/cartoon_eye_of_horus.png',
    '/images/cartoon_pyramid.png',
    '/images/cartoon_mummy.png',
];

export function GoddessSpinner({ size = 64, interval = 800 }: GoddessSpinnerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % GODDESS_IMAGES.length);
        }, interval);

        return () => clearInterval(timer);
    }, [interval]);

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            {/* White background circle for "icon" look */}
            <motion.div
                className="absolute inset-0 bg-white rounded-full shadow-md border-2 border-yellow-200"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            />

            <AnimatePresence mode='popLayout'>
                <motion.div
                    key={currentIndex}
                    className="absolute inset-0 flex items-center justify-center p-1.5"
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <img
                        src={GODDESS_IMAGES[currentIndex]}
                        alt="Loading..."
                        loading="eager"
                        className="w-full h-full object-contain drop-shadow-sm"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Orbiting ring for extra "loading" feel */}
            <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 border-r-orange-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                style={{ width: size + 8, height: size + 8, margin: -4 }}
            />
        </div>
    );
}
