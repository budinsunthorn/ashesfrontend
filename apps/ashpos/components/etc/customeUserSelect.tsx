import React, { Dispatch, SetStateAction, useState, useEffect, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { FaPlus } from 'react-icons/fa';
import { TbUser } from 'react-icons/tb';
import { RiUserFill } from 'react-icons/ri';
import IconSearch from '../icon/icon-search';

// Define a generic type for the state setter function
type StateSetter<T> = Dispatch<SetStateAction<T>>;

interface Option {
    value: string;
    label: string;
}

interface OptionsType {
    options: Option[];
    onChange: (value: string) => void;
    currentOption: string | undefined;
    setModalShow?: StateSetter<boolean>;
    onSearch?: (searchTerm: string) => void;
    disabled: boolean
    isAddCustomerIcon?: boolean
    searchDisplayText?: string
    showingSearch?: boolean
    showingText?: string
    autoFocus?: boolean
    isSelectOpen?: boolean
}

const CustomUserSelect: React.FC<OptionsType> = ({ options, onChange, currentOption, setModalShow, onSearch, disabled = false, isAddCustomerIcon = false, showingSearch = true, showingText = 'Select a customer',  searchDisplayText = 'Search...', autoFocus = false, isSelectOpen = false }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // const filteredOptions = options?.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
        if (currentOption !== undefined) {
            const initialIndex = options.findIndex((option) => option.label.includes(currentOption));
            setHighlightedIndex(initialIndex >= 0 ? initialIndex : null);
        }
    }, [currentOption, options]);

    // const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    //     if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    //         e.preventDefault();
    //         let newIndex = highlightedIndex;

    //         if (e.key === 'ArrowDown') {
    //             newIndex = highlightedIndex === null ? 0 : (highlightedIndex + 1) % filteredOptions.length;
    //         }

    //         if (e.key === 'ArrowUp') {
    //             newIndex = highlightedIndex === null ? filteredOptions.length - 1 : (highlightedIndex - 1 + filteredOptions.length) % filteredOptions.length;
    //         }

    //         setHighlightedIndex(newIndex);
    //     }

    //     if (e.key === 'Enter' && highlightedIndex !== null) {
    //         onChange(filteredOptions[highlightedIndex].value);
    //         setIsOpen(false);
    //     }
    // };
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        if(onSearch) {
            onSearch(event.target.value)
        }
    };

    const handleOptionClick = (option: Option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    const toggleDropdown = (e: React.MouseEvent) => {
        if(disabled) return
        inputRef.current?.focus();
        e.stopPropagation();
        setIsOpen(!isOpen);
        if (!isOpen && inputRef.current) {
            inputRef.current.focus(); // Focus the input when dropdown opens
        }
    };
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if(isSelectOpen) {
            setIsOpen(true);
            inputRef.current?.focus();
        }
    }, [isSelectOpen]);

    

    return (
        <div className={`relative w-full border-[1px] dark:border-[#1c2942] text-gray-600 rounded-lg ${isOpen ? 'border-blue-500' : ''} `} ref={dropdownRef}>
            <div onClick={toggleDropdown} className={`w-full flex justify-start items-center px-3 py-2 boder-[1px] border-[#ccc] dark:border-[#081223] rounded-lg text-dark dark:text-white-dark ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                {isAddCustomerIcon && <RiUserFill className='mr-1'/>}
                {currentOption ? currentOption : showingText}
            </div>
            {isOpen && (
                <div className="absolute w-full top-[105%] left-0 right-0 border-[1px] border-[#ccc] dark:border-[#1c294225] bg-white dark:bg-[#0e1726] z-[100000]">
                    {showingSearch && <div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder={searchDisplayText}
                        disabled={disabled}
                        autoFocus={autoFocus}
                        className="w-full pr-1 pl-8 py-3 box-border border-[1px] dark:border-[#1c2942] dark:bg-[#142035] focus:outline-none text-dark dark:text-white-dark focus:border-primary dark:focus:border-primary rounded-md bg-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    <button type="button" className="absolute top-1 inset-0 h-9 w-9 appearance-none text-white-dark peer-focus:text-primary ltr:right-auto rtl:left-auto">
                        <IconSearch className="mx-auto" />
                    </button></div>}
                    { isAddCustomerIcon && <button type="button" className="absolute top-1 right-3 btn btn-outline-primary btn-sm ml-2 mt-1 rtl:mr-2 p-2 shadow shadow-indigo-500/50" onClick={() => {if(setModalShow) setModalShow(true)}}>
                        <FaPlus />
                    </button>}
                    <PerfectScrollbar>
                        <ul className="list-none p-0 m-0 max-h-[420px] z-[9999]">
                            {options?.map((option, index) => (
                                <li
                                    className={`flex justify-start items-center p-2 cursor-pointer hover:bg-[#eee] dark:hover:bg-[#1c2942] text-dark dark:text-white-dark ${highlightedIndex == index ? 'bg-[#eee] dark:bg-[#1c2942]' : ''}`}
                                    key={option.value}
                                    onClick={() => handleOptionClick(option)}
                                >
                                    {/* <RiUserFill className='mr-1'/> */}
                                    {/* {String(option.label)} */}
                                    {option.label}
                                </li>
                            ))}
                        </ul>
                    </PerfectScrollbar>
                </div>
            )}
        </div>
    );
};

export default CustomUserSelect;
