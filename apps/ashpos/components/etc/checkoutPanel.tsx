'use client';
import { truncateToTwoDecimals, setFourDecimals } from '@/lib/utils';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BsCashCoin, BsCreditCard2Back } from 'react-icons/bs';
import { FaMinusCircle } from 'react-icons/fa';
import { FaMoneyBillTransfer } from 'react-icons/fa6';
import { GiCancel } from 'react-icons/gi';
import { MdCancel, MdOutlineCancel } from 'react-icons/md';
import { TbFlagCancel } from 'react-icons/tb';

// Define a generic type for the state setter function
type StateSetter<T> = Dispatch<SetStateAction<T>>;

interface CheckoutPanelProps {
    orderNumber: number;
    amount?: number;
    payAmount: number;
    setPayAmount: StateSetter<number>;
    otherAmount: number;
    setOtherAmount: StateSetter<number>;
    isCashed: boolean;
    setIsCashed: StateSetter<boolean>;
    currentSlide: number;
}
interface NumberButton {
    text: any;
    currentValue?: number;
    disabled?: boolean;
    setValue: StateSetter<number>;
    isComma?: boolean;
    setIsComma?: StateSetter<boolean>;
}
const NumberButton = ({ text, currentValue, disabled, setValue, isComma, setIsComma }: NumberButton) => {
    const handleSetValue = (value: any) => {
        if (Number.isFinite(value) && value < 10 && currentValue) {
            if (isComma) {
                //if comma button is click, so current number is decimal
                if (Math.floor(currentValue) < currentValue) setValue(Number(truncateToTwoDecimals(currentValue + value)));
                else setValue(Number(truncateToTwoDecimals(currentValue)) + Number(truncateToTwoDecimals(value)));
            } else {
                setValue(currentValue * 10 + Number(truncateToTwoDecimals(value)));
            }
        } else if (value === 'C') {
            setValue(0);
            if (setIsComma) setIsComma(false);
        } else if (value === '.') {
            if (setIsComma) setIsComma(true);
        } else setValue(Number(truncateToTwoDecimals(value)));
    };
    return (
        <button
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1c2942] dark:hover:bg-[#1f3556] text-2xl text-dark dark:text-white-dark text-center px-5 py-3 rounded-sm cursor-pointer dark:disabled:bg-[#141e31] dark:disabled:text-gray-600 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
            disabled={disabled}
            onClick={() => handleSetValue(text)}
        >
            {text > 9 ? '$' + text : text}
        </button>
    );
};

function CheckoutPanel({ orderNumber, amount = 0, payAmount, setPayAmount, otherAmount, setOtherAmount, isCashed, setIsCashed, currentSlide }: CheckoutPanelProps) {
    const [isComma, setIsComma] = useState(false);
    const [inputValue, setInputValue] = useState(0);

    const padWithZeros = (value: any | number, length: number) => {
        return value.toString().padStart(length, '0');
    };

    useEffect(() => {
        setInputValue(0);
    }, [orderNumber]);

    return (
        <div className="w-full h-full text-dark dark:text-gray-300">
            <div className="justify-between -m-5 mb-5 flex  items-start border-b border-white-light py-2 px-5 dark:border-[#1b2e4b]">
                <div className="text-lg py-1">Sales Order #{orderNumber}</div>
            </div>
            <div className="flex flex-col">
                <div className="flex flex-wrap justify-center items-start">
                    <div className="flex flex-col items-center w-full xl:w-4/6">
                        {/* cash input */}
                        <div className="w-5/6 flex m-2 p-1 text-xl">
                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                $
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Enter amount"
                                className="w-full text-xl form-input rounded-none disabled:cursor-not-allowed no-spinner"
                                value={Number(truncateToTwoDecimals(inputValue))}
                                disabled={isCashed}
                                onChange={(e) => {
                                    // const value = e.target.value;
                                    if (/^\d*\.?\d{0,2}$/.test(e.target.value)) setInputValue(parseFloat(e.target.value));
                                }}
                            />
                            <div className="bg-[#eee] flex justify-center items-center text-nowrap ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                of ${amount - payAmount - otherAmount > 0 ? truncateToTwoDecimals(amount - payAmount - otherAmount) : '0.00'}
                            </div>
                        </div>
                        {/* number panel */}

                        <div className="flex w-5/6">
                            <div className="flex flex-wrap justify-between items-start w-4/6 mb-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '.'].map((n: any, i: any) => (
                                    <div key={i} className="w-1/3 p-1">
                                        <NumberButton text={n} currentValue={inputValue} setValue={setInputValue} disabled={isCashed} isComma={isComma} setIsComma={setIsComma} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col w-2/6">
                                <div className="p-1">
                                    <NumberButton text={truncateToTwoDecimals(amount)} setValue={setInputValue} disabled={isCashed} />
                                </div>
                                <div className="p-1">
                                    <NumberButton text={amount ? Math.ceil(amount / 10) * 10 : 0} setValue={setInputValue} disabled={isCashed} />
                                </div>
                                {Math.floor(amount / 100) * 100 + 50 > Math.ceil(amount / 10) * 10 ? (
                                    <div className="p-1">
                                        <NumberButton text={amount ? Math.floor(amount / 100) * 100 + 50 : 0} setValue={setInputValue} disabled={isCashed} />
                                    </div>
                                ) : null}
                                <div className="p-1">
                                    <NumberButton text={amount ? Math.ceil(amount / 100) * 100 : 0} setValue={setInputValue} disabled={isCashed} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* cash button */}
                    <div className="m-2 p-1">
                        <button
                            type="button"
                            className="flex items-center btn btn-outline-warning btn-lg w-36 mb-2"
                            disabled={isCashed || currentSlide === 3}
                            onClick={() => {
                                setPayAmount(inputValue);
                            }}
                        >
                            <BsCashCoin className="mr-2" />
                            Cash
                        </button>
                        {/* <button
                            type="button"
                            className="flex items-center btn btn-outline-dark btn-lg w-36 mb-2"
                            disabled={isCashed || currentSlide === 3}
                            onClick={() => {
                                setOtherAmount(inputValue)
                            }}
                        >
                            <BsCreditCard2Back className="mr-2" />
                            Other
                        </button> */}
                        {/* {isCashed && currentSlide == 2 ? (
                            <button
                                type="button"
                                className="flex items-center mr-2 btn btn-outline-secondary btn-lg mt-2 w-36"
                                onClick={() => {
                                    setIsCashed(false);
                                    setPayAmount(0);
                                }}
                            >
                                <MdOutlineCancel className="mr-2 text-xl" />
                                Cancel
                            </button>
                        ) : null} */}
                    </div>
                </div>
                {/* pay information */}
                <div className="flex flex-col justify-between px-3 w-5/6 mt-5 mx-auto">
                    <div className="flex flex-col justify-between w-full px-2 md:w-3/6 mx-auto">
                        <div className="flex justify-between items-center text-xl text-center dark:text-white-dark text-dark py-1">
                            <div>- Total with Taxes</div>
                            <div className="font-bold text-xl">${truncateToTwoDecimals(amount)}</div>
                        </div>
                        <div className="text-xl dark:text-white-dark text-dark ">- Payment</div>
                        {payAmount != 0 ? (
                            <div className="flex justify-between items-center text-lg text-center dark:text-white-dark text-dark py-1 ml-4">
                                <div>Cash</div>
                                <div className="relative flex items-center font-bold text-lg">
                                    <span className="">${truncateToTwoDecimals(payAmount)}</span>
                                    <button className="ml-2 absolute left-[105%] flex justify-start items-center cursor-pointer badge badge-outline-secondary" onClick={() => setPayAmount(0)}>
                                        Cancel <GiCancel className="ml-1 text-sm" />
                                    </button>
                                </div>
                            </div>
                        ) : null}
                        {otherAmount != 0 ? (
                            <div className="flex justify-between items-center text-lg text-center dark:text-white-dark text-dark py-1 ml-4">
                                <div>Other</div>
                                <div className="relative flex items-center font-bold text-lg">
                                    <span className="">${truncateToTwoDecimals(otherAmount)}</span>
                                    <button className="ml-2 absolute left-[105%] flex justify-start items-center cursor-pointer badge badge-outline-secondary" onClick={() => setOtherAmount(0)}>
                                        Cancel <GiCancel className="ml-1 text-sm" />
                                    </button>
                                </div>
                            </div>
                        ) : null}
                        <div className="flex justify-between items-center text-xl text-center dark:text-white-dark text-dark py-1">
                            <div>- Change Due</div>
                            <div className={`font-bold text-xl   ${setFourDecimals(payAmount) + setFourDecimals(otherAmount) - setFourDecimals(amount) < 0 ? 'text-red-500' : 'text-[#00ab55]'}`}>
                                ${truncateToTwoDecimals(setFourDecimals(payAmount) + setFourDecimals(otherAmount) - setFourDecimals(amount))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPanel;
