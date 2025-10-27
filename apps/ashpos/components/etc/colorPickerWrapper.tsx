import React from 'react';  
import { CirclePicker, ColorResult } from 'react-color';  

// Define the props interface  
interface CirclePickerWrapperProps {  
    color?: string; // Optional color prop  
    colors?: string[]; // Optional array of colors  
    onChange: (color: ColorResult) => void; // onChange function with ColorResult type  
}  

const CirclePickerWrapper: React.FC<CirclePickerWrapperProps> = ({  
    color = '#fff',  
    colors = [],  
    onChange,  
}) => {  
    return (  
        <CirclePicker  
            color={color}  
            colors={colors}  
            onChange={onChange}  
        />  
    );  
};  

export default CirclePickerWrapper;