/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Film, Play } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      id="splash-container"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#121212] font-sans"
    >
      <div className="text-center px-4 max-w-md w-full">
        {/* Animated Brand Emblem */}
        <motion.div
          id="splash-logo-wrapper"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.15, 1], opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div className="bg-[#E50914] p-3 rounded-xl shadow-[0_0_20px_rgba(229,9,20,0.6)] flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
          <span className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">
            ACADEMY<span className="text-[#E50914]">FLIX</span>
          </span>
        </motion.div>

        {/* Cinematic Slogan */}
        <motion.p
          id="splash-tagline"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-gray-400 text-sm md:text-base font-medium tracking-wide mb-10"
        >
          Netflix-Style Learning, Endless Opportunities
        </motion.p>

        {/* Crimson Progress Indicator */}
        <div id="splash-progress-track" className="w-full bg-[#202022] h-[4px] rounded-full overflow-hidden mb-3">
          <motion.div
            id="splash-progress-fill"
            className="bg-[#E50914] h-full shadow-[0_0_10px_rgba(229,9,20,0.8)]"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 font-mono">
          <span>INITIALIZING PLATFORMS</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
