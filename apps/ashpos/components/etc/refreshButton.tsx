'use client';

import { MdOutlineRefresh } from 'react-icons/md';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface RefreshButtonProps {
    onClick: () => void; // Define the type for the onClick prop
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick }) => {
    return (
        <Tippy content="Refresh" placement="top">
            <button type="button" className="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-2 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark" onClick={onClick}>
                <MdOutlineRefresh  className="text-xl"/>
            </button>
        </Tippy>
    );
};

export default RefreshButton;
