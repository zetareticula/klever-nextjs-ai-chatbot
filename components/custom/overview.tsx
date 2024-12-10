import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from 'react';

import { LogoOpenAI, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  const [fontSize, setFontSize] = useState(18); // Dynamic font size control
  
  return (
    <div className="relative max-w-screen-md p-4 md:p-6 mx-auto flex min-h-screen overflow-y-auto">
      {/* Main flex container without using <main> */}
      <div className="w-full bg-gradient-to-br from-yellow-300 via-orange-200 to-red-200 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <motion.div
            key="overview"
            className="p-6 space-y-6"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-center text-orange-800">Klever Overview</h1>
            
            {/* Font size control */}
            <div className="flex items-center space-x-4">
              <span className="text-xl font-medium">Font Size:</span>
              <input
                type="range"
                min="16"
                max="32"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-64 h-6"
              />
              <span className="text-xl font-medium">{fontSize}px</span>
            </div>

            {/* Flex container for icons */}
            <p className="flex flex-row justify-center gap-4 items-center text-orange-800" style={{ fontSize: `${fontSize}px` }}>
              <VercelIcon />
              <span>+</span>
              <MessageIcon />
            </p>

            {/* Overview description */}
            <p style={{ fontSize: `${fontSize}px` }}>
              This is Klever AI, a chat application with accessibility in mind. Built with{" "}
              <code className="rounded-md bg-orange-200 px-1 py-0.5">streamText</code>{" "}
              from the AI SDK, it provides a user-friendly chat experience using the{" "}
              <code className="rounded-md bg-orange-200 px-1 py-0.5">useChat</code> hook on the client side to ensure a seamless chat experience.
            </p>

            {/* Documentation Link */}
            <p style={{ fontSize: `${fontSize}px` }}>
              You can learn more about the Kernel AI SDK by visiting the{" "}
              <Link
                className="text-orange-500 dark:text-orange-400"
                href="https://zetareticula.com"
                target="_blank"
              >
                Docs
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Overview;