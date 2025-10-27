'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCross, FaTimes } from 'react-icons/fa';

interface BirthdayAlertProps {
    name: string;
    setBirthdayShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const BirthdayAlert: React.FC<BirthdayAlertProps> = ({ name, setBirthdayShow }) => {
    const [showAlert, setShowAlert] = useState(true);
    const confetti = ['🎉', '🎈', '🎊', '🎂', '🥳'];

    // useEffect(() => {
    //   const timer = setTimeout(() => {
    //     setShowAlert(false)
    //   }, 10000) // Hide after 10 seconds

    //   return () => clearTimeout(timer)
    // }, [])

    if (!showAlert) return null;
    const handleClick = () => {
        setBirthdayShow(false);
    };

    return (
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="top-4 z-50">
            <div className="relative py-1 px-2 rounded-sm shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient"></div>
                <div className="flex justify-between items-center relative z-10">
                    <div className="px-10">
                        <h2 className="text-lg text-nowrap font-bold font-montserrat text-pink-100 text-center animate-pulse">✨ Happy Birthday to {name}! ✨</h2>
                    </div>
                    <FaTimes className="text-indigo-300 hover:text-white" onClick={() => handleClick()} />
                    {/* <p className="text-md text-white text-center ml-2">
            Today is {name}'s birthday.
          </p> */}
                </div>
                {confetti.map((emoji, index) => (
                    <motion.span
                        key={index}
                        className="absolute text-2xl"
                        initial={{ opacity: 0, y: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            y: [0, -50, -100],
                            x: Math.random() * 100 - 50,
                            rotate: Math.random() * 360,
                            transition: {
                                duration: 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            },
                        }}
                    >
                        {emoji}
                    </motion.span>
                ))}
            </div>
        </motion.div>
    );
};

export default BirthdayAlert;
