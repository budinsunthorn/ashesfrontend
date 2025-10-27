import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { quantityAbbreviations, quantityTypes, registerLabel } from '@/utils/variables';
import { useDrawerReportByDrawerIdQuery, usePrintSettingByDispensaryIdQuery, useReceiptByOrderIdQuery } from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
import warnAlert from '../notification/warnAlert';
import { FaPrint } from 'react-icons/fa';
import Barcode from 'react-barcode';
import { convertPSTTimestampToTimezone, formatFullDateFns, getCurrentTimeByTimezone } from '@/utils/datetime';
import { Divider } from '@mantine/core';

interface DropPrintData {
    drop_type: string, // drop type: IN/OUT
    amount: number,
    reason: string,
}

function MoneyDropPrint({ data, current_drawer, text, className, printButtonRef }: { data: DropPrintData, current_drawer: string,  text?: string, className: string, printButtonRef?: React.RefObject<HTMLDivElement> }) {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const storeTimeZone = userData.storeTimeZone;
    const storeName = userData.storeName
    const userName = userData.name
    const drawerReportContentRef = useRef<HTMLDivElement>(null);


    const printSettingRowData = usePrintSettingByDispensaryIdQuery({dispensaryId: dispensaryId})
    const printSettingData = printSettingRowData.data?.printSettingByDispensaryId

    const drawerPrintSettingData = printSettingData?.find((item) => item?.printType === 'moneyDrop') || null

    // console.log('drawerPrintSettingData', drawerPrintSettingData);

    const handleDrawerReportPrint = useReactToPrint({
        contentRef: drawerReportContentRef,
        // Dynamic page style with dimensions, margins, and font size
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            @page {
                size: ${drawerPrintSettingData?.dimensionWidth ? drawerPrintSettingData?.dimensionWidth + 'in' : 'auto'} ${drawerPrintSettingData?.dimensionHeight ? drawerPrintSettingData?.dimensionHeight + 'in' : 'auto'};
                margin: ${drawerPrintSettingData?.marginTop ? drawerPrintSettingData?.marginTop + 'in' : '0'} ${drawerPrintSettingData?.marginRight ? drawerPrintSettingData?.marginRight + 'in' : '0'} ${drawerPrintSettingData?.marginBottom ? drawerPrintSettingData?.marginBottom + 'in' : '0'} ${drawerPrintSettingData?.marginLeft ? drawerPrintSettingData?.marginLeft + 'in' : '0'};
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', Arial, sans-serif !important;
                }
                * {
                    box-sizing: border-box;
                    font-size: ${drawerPrintSettingData?.fontSize ? drawerPrintSettingData?.fontSize + 'px' : '14px'};
                }
            }
        `,
        onAfterPrint: () => {
            console.log('Print completed');
        }
    });

    return (
        <div>
            <div
                ref={printButtonRef}
                className={className}
                onClick={() => handleDrawerReportPrint()}
            ><FaPrint className="mr-1" />
                &nbsp;
                {text || 'Print Money Drop Data'}
            </div>
            <div className='hidden'>
            <div ref={drawerReportContentRef} style={{
                width: drawerPrintSettingData?.dimensionWidth ? `${drawerPrintSettingData?.dimensionWidth}in` : '200px',
                height: drawerPrintSettingData?.dimensionHeight ? `${drawerPrintSettingData?.dimensionHeight}in` : '100%',
                // margin: drawerPrintSettingData?.marginLeft ? `${drawerPrintSettingData?.marginLeft}in` : '0',
                marginTop: drawerPrintSettingData?.marginTop ? `${drawerPrintSettingData?.marginTop}in` : '0',
                marginLeft: drawerPrintSettingData?.marginLeft ? `${drawerPrintSettingData?.marginLeft}in` : '0',
                fontSize: drawerPrintSettingData?.fontSize ? `${drawerPrintSettingData?.fontSize}px` : '14px',
                fontFamily: 'Roboto',
            }}>
                {drawerPrintSettingData?.topText && (
                    <div className="mb-2" style={{fontSize: `${drawerPrintSettingData?.fontSize}pt`}}>
                        {drawerPrintSettingData?.topText}
                    </div>
                )}
                <h1 className='text-lg font-semibold text-black dark:text-white-dark'>{storeName}</h1>
                <h1 className='text-lg font-semibold text-black dark:text-white-dark'>{current_drawer}</h1>
                <div className="flex flex-col justify-between items-start mb-2 mt-3 w-full">
                <div className='flex justify-start items-center text-[8px] leading-none'><p className='font-semibold'>User:</p><p className='ml-2'>{userName}</p></div>
                    <div className='flex justify-start items-center text-[8px] leading-none'><p className='font-semibold'>Drop Type:</p><p className='ml-2'>{data.drop_type == "IN" ? "Drop In" : "Drop Out"}</p></div>
                    <div className='flex justify-start items-center text-[8px] leading-none'><p className='font-semibold'>Drop Amount:</p><p className='ml-2'>${data.amount}</p></div>
                    <div className='flex justify-start items-center text-[8px] leading-none'><p className='font-semibold'>Drop Reason:</p><p className='ml-2'>{data.reason}</p></div>
                    <div className='flex justify-start items-center text-[8px] leading-none'><p className='font-semibold'>Time:</p><p className='ml-2'>{convertPSTTimestampToTimezone(Number(Date.now()), storeTimeZone)}</p></div>
                </div>
                {drawerPrintSettingData?.topText && (
                    <div className="" style={{fontSize: `${drawerPrintSettingData?.fontSize}pt`}}>
                        {drawerPrintSettingData?.bottomText}
                    </div>
                )}
                <Divider className='my-3' />
                
            </div>
            </div>
        </div>
    );
}

export default MoneyDropPrint;
