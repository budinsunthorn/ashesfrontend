'use client';
import React from 'react';
import { BackColors, DarkFontColors } from '@/store/colors';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

const ProductCategory = ({ name, color }: { name: any; color: any }) => {
    const index = BackColors.findIndex(bgcolor => bgcolor?.toLowerCase() === color?.toLowerCase());
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    // console.log(color, index) 
    return (
        <span className={`badge !font-[400] text-nowrap text-center dark:!text-[${DarkFontColors[index]}] !bg-[${color}]`} style={{ backgroundColor: color, color: themeConfig.theme == 'dark' ?  DarkFontColors[index] : 'white' }}>
            {name}
        </span>
        // <div className="flex items-center mx-1 w-fit">
        //     <div className="rounded-sm text-white p-1 text-xs border-none w-full h-fit" style={{ backgroundColor: color }}>
        //         {name}
        //     </div>
        // </div>
    );
};

export default ProductCategory;
