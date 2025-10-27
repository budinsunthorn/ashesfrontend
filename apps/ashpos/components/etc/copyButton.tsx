import { FaCopy } from "react-icons/fa";

import successAlert from "../notification/successAlert";
import { useEffect, useState } from "react";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
export default function CopyButton({ text, onCopy, className = "" }: { text: string; onCopy?: () => void; className?: string }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        successAlert('Copied to clipboard');
        if (onCopy) onCopy();
        setIsCopied(true);
    };
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsCopied(false);
        }, 3000);
    }, [isCopied]);

    return (
        <button 
            onClick={handleCopy}
            className={`hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${className}`}
            title="Copy to clipboard"
        >
            {isCopied ? (
                <IoCheckmarkDoneSharp className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            ) : (
                <FaCopy className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            )}
        </button>
    );
}