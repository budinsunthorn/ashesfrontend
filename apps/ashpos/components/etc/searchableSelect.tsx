import React from 'react';
import Select, { StylesConfig, SingleValue, MultiValue } from 'react-select';
import { useSelector } from 'react-redux';
import { IRootState } from 'store';
// Define the type for the option
interface OptionType {
    value: any;
    label: any;
}

// Define the props for the MySelectComponent
interface MySelectComponentProps {
    options?: OptionType[]; // Optional options prop
    placeholder?: string; // Optional placeholder prop
    isSearchable?: boolean; // Optional isSearchable prop
    className?: string; // Optional className prop
    value?: SingleValue<OptionType> | MultiValue<OptionType> | null; // Optional value prop
    isMulti?: boolean | undefined; // Optional ismulti prop
    onFocus?: () => void;
    onBlur?: () => void;
    onChange: (value: SingleValue<OptionType> | MultiValue<OptionType>) => void; // Optional onChange handler
}

const SearchableSelect: React.FC<MySelectComponentProps> = ({ options = [], placeholder, isSearchable, value, isMulti = false, className = '', onChange }) => {
    // Access the Redux state
    const isDarkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);
    // Define custom styles type for react-select
    // console.log(className.indexOf('has-error'))
    const customStyles: StylesConfig<OptionType> = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: className.indexOf('has-error') > 0 ? '#e7515a14' :( isDarkMode ? '#141e33' : '#FFFFFF'),
            borderColor: className.indexOf('has-error') > 0 ? "#e7515a" : (state.isFocused ? '#2563eb' : isDarkMode ? '#141e33' : '#e2e8f0'),
            borderRadius: '5px',
            width: '100%',
            '&:hover': {
                borderColor: isDarkMode ? '#141e33' : '#e2e8f0',
            },
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: isDarkMode ? '#888ea8' : '#141e33',
        }),
        option: (provided, state) => ({
            ...provided,
            // backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            backgroundColor: isDarkMode ? '#141e33' : '#FFFFFF',
            borderColor: state.isFocused ? '#2563eb' : isDarkMode ? '#242e33' : '#e2e8f0',
            color: isDarkMode ? '#888ea8' : '#141e33',
            '&:hover': {
                backgroundColor: '#2563eb',
                color: '#FFFFFF',
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#141e33' : '#FFFFFF',
            fontSize: '14px',
            padding: '0px',
            scrollbarColor: isDarkMode ? '#141e33' : '#FFFFFF',
            msScrollbarBaseColor: isDarkMode ? '#141e33' : '#FFFFFF'

        }),
        input: (provided) => ({
            ...provided,
            color: isDarkMode ? '#898ea9' : '', // Change this to your desired color
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? '#222b49' : '#eeeeee', // Background color of each selected item
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: isDarkMode ? '#898ea9' : '', // Text color of each selected item
        }),
        multiValueRemove: (base, state) => ({
            ...base,
            color: isDarkMode ? '#898ea9' : '#252c3b', // Remove icon color
            backgroundColor: isDarkMode ? '#333e60' : '#dadada',
            ':hover': {
                backgroundColor: isDarkMode ? '#333e60' : '#c6c6c6',
                color: isDarkMode ? 'white' : 'black',
            },
        }),
        
        
        
    };
    const handleSelectTouchStart = (e : any) => {
        e.stopPropagation(); // Prevent Swiper from capturing the touch event
      };
    return (
        <div className='min-w-80' onTouchStart={handleSelectTouchStart}>
        <Select
            onChange={(e) => onChange(e)}
            isSearchable={isSearchable}
            value={value}
            isMulti={isMulti}
            options={options}
            placeholder={placeholder}
            styles={customStyles}
            className={className} // Tailwind CSS class for dark mode
            classNamePrefix="react-select" // Prefix for custom classes
        />
        </div>
    );
};

export default SearchableSelect;
