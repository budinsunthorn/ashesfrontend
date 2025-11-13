import React, { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';
import { useAllItemCategoriesByDispensaryIdQuery } from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
import ProductCategory from './productCategory';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

type StateSetter<T> = Dispatch<SetStateAction<T>>;

interface ProsType {
    onChange: (id: string | undefined) => void;
    currentCategoryId: string;
}

function CategorySelect({ onChange, currentCategoryId }: ProsType) {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const [currentCategory, setCurrentCategory] = useState({
        name: "",
        color: ""
    });
    const [showCategoryList, setShowCategoryList] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);

    const allItemCategoriesByDispensaryId = useAllItemCategoriesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const itemCategories = allItemCategoriesByDispensaryId.data?.allItemCategoriesByDispensaryId;

    useEffect(() => {
        const category = itemCategories?.find((item) => item?.id == currentCategoryId);

        setCurrentCategory({
            name: (currentCategoryId == 'all' ? 'All Categories' : category?.name) || "",
            color: (currentCategoryId == 'all' ? '#434745' : category?.color) || ""
        });
    }, [currentCategoryId]);

    useEffect(() => {
        window.addEventListener('mousedown', handleOutsideClick);

        return () => {
            window.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const handleOutsideClick = (e: MouseEvent) => {
        if (divRef.current && !divRef.current.contains(e.target as Node)) {
            setShowCategoryList(false);
        }
    };

    return (
        <div className="relative w-56 flex flex-col justify-start items-start">
            <div className={`w-full p-2 border dark:border-[#17263c] px-4 py-2 rounded-lg overflow-hidden cursor-pointer ${showCategoryList ? 'border-primary' : ''}`} onClick={() => setShowCategoryList(!showCategoryList)}>
                {currentCategoryId == 'all' ? <span className='italic text-[15px]'>--All Categories--</span> : <ProductCategory name={currentCategory.name} color={currentCategory.color}/>}
            </div>
            {showCategoryList && <div className="absolute bg-white dark:bg-black top-[105%] h-96 z-[999]" ref={divRef}>
                <PerfectScrollbar>
                    <div
                        className="p-2 border-[1px] border-gray-200 dark:border-[#17263c] z-[999] hover:bg-gray-50 dark:hover:bg-black-medium cursor-pointer"
                        onClick={() => {
                            onChange('all');
                            setShowCategoryList(false);
                        }}
                    >
                        {/* <ProductCategory name="All Categories" color={'#434745'} /> */}
                        <span className='italic text-[15px]'>--All Categories--</span>
                    </div>
                    {itemCategories?.map((item, idx) => (
                            <div
                                key={idx}
                                className="p-2 border-[1px] border-gray-200 dark:border-[#17263c] z-[999] hover:bg-gray-50 dark:hover:bg-black-medium cursor-pointer"
                                onClick={() => {
                                    onChange(item?.id);
                                    setShowCategoryList(false);
                                }}
                            >
                                <ProductCategory name={item?.name} color={item?.color} />
                            </div>
                        ))}
                </PerfectScrollbar>
            </div>}
        </div>
    );
}

export default CategorySelect;
