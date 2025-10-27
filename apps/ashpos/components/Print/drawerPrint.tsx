import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { quantityAbbreviations, quantityTypes, registerLabel } from '@/utils/variables';
import { useDrawerReportByDrawerIdQuery, usePrintSettingByDispensaryIdQuery, useReceiptByOrderIdQuery } from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
import warnAlert from '../notification/warnAlert';
import { FaPrint } from 'react-icons/fa';
import Barcode from 'react-barcode';
import { formatCurrency, truncateToTwoDecimals } from '@/lib/utils';
import { convertPSTTimestampToTimezone, formatFullDateFns, getCurrentTimeByTimezone } from '@/utils/datetime';
import { Divider } from '@mantine/core';

function DrawerPrint({ drawerId, text, className, printButtonRef }: { drawerId: string; text: string, className: string, printButtonRef?: React.RefObject<HTMLDivElement> }) {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const storeTimeZone = userData.storeTimeZone;
    const drawerReportContentRef = useRef<HTMLDivElement>(null);

    // Query
    const drawerReportByDrawerId = useDrawerReportByDrawerIdQuery({ drawerId: drawerId || '' });
    const drawerReportData: any = drawerReportByDrawerId.data?.drawerReportByDrawerId; 

    const printSettingRowData = usePrintSettingByDispensaryIdQuery({dispensaryId: dispensaryId})
    const printSettingData = printSettingRowData.data?.printSettingByDispensaryId

    const drawerPrintSettingData = printSettingData?.find((item) => item?.printType === 'drawer') || null

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
                {text || 'Print Drawer Data'}
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
                <h1 className='text-lg font-semibold text-black dark:text-white-dark'>Shift Details</h1>
                <div className="flex flex-col justify-between items-start mb-3 w-full">
                    <div className='flex justify-start items-center text-[8px] leading-none'><p>Store:</p><p className='ml-2'>{drawerReportData?.storeName}</p></div>
                    <div className='flex justify-start items-center text-[8px] leading-none'><p>Shift Started:</p><p className='ml-2'>{convertPSTTimestampToTimezone(Number(drawerReportData?.startedAt), storeTimeZone)}</p></div>
                    <div className='flex justify-start items-center text-[8px] leading-none'><p>Time Printed:</p><p className='ml-2'>{getCurrentTimeByTimezone(storeTimeZone)}</p></div>
                </div>
                <Divider className='my-3' />
                <div className="flex flex-col justify-between items-start mb-3 w-full">
                    <div className='flex justify-between items-center w-full' style={{
                        fontSize: `${drawerPrintSettingData?.fontSize}px`
                    }}><p>Register Name:</p><p>{drawerReportData?.registerName && registerLabel[drawerReportData?.registerName]}</p></div>
                    <div className='flex justify-between items-center w-full' style={{
                        fontSize: `${drawerPrintSettingData?.fontSize}px`
                    }}><p>Started By:</p><p>{drawerReportData?.startedBy}</p></div>
                    <div className='flex justify-between items-center w-full' style={{
                        fontSize: `${drawerPrintSettingData?.fontSize}px`
                    }}><p>Started At:</p><p>{convertPSTTimestampToTimezone(Number(drawerReportData?.startedAt), storeTimeZone)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{
                        fontSize: `${drawerPrintSettingData?.fontSize}px`
                    }}><p>Ended By:</p><p>{drawerReportData?.startedBy}</p></div>
                    <div className='flex justify-between items-center w-full' style={{
                        fontSize: `${drawerPrintSettingData?.fontSize}px`
                    }}><p>Ended At:</p><p>{convertPSTTimestampToTimezone(Number(drawerReportData?.endedAt), storeTimeZone)}</p></div>
                </div>
                <Divider className='my-3'/>
                <div className="flex flex-col justify-between items-start mb-3 w-full">
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}>
                        <p>Starting Balance:</p>
                        <p>{formatCurrency(drawerReportData?.startingBalance)}</p>
                    </div>
                        <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}>
                        <p>Starting Discrepancy:</p>
                        <p>{drawerReportData?.discrepancyReason}</p>
                    </div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}>
                        <p>Discrepancy Reason:</p>
                        <p>{'_'}</p>
                    </div>
                </div>

                <div className="flex flex-col justify-between items-start mb-3 w-full">
                    <div className='flex justify-between items-center w-full mt-5'><p>Returns:</p><p>{formatCurrency(drawerReportData?.returns)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Voids:</p><p>{formatCurrency(drawerReportData?.voids)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Incoming Drops:</p><p>{formatCurrency(drawerReportData?.incomingDrops)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Outgoing Drops:</p><p>{formatCurrency(drawerReportData?.outgoingDrops)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Closing Drop:</p><p>{formatCurrency(drawerReportData?.closingDrop)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Left In Drawer:</p><p>{formatCurrency(drawerReportData?.leftInDrawer)}</p></div>
                    <div className='flex justify-between items-center w-full mt-5'><p>Expected Cash In Drawer:</p><p>{formatCurrency(drawerReportData?.expectedCash)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Actual Cash In Drawer:</p><p>{formatCurrency(drawerReportData?.actualCashInDrawer)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Closing Discrepancy:</p><p>{formatCurrency(drawerReportData?.closingDiscrepancy)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Discrepancy Reason:</p><p>{drawerReportData?.discrepancyReason}</p></div>
                    <div className='flex justify-between items-center w-full mt-5'><p>Cash Sales:</p><p>{formatCurrency(drawerReportData?.cashPayments)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Other Sales:</p><p>{formatCurrency(drawerReportData?.otherPayments)}</p></div>
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Total Sales:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div>
                </div>
                <p className='text-md text-left !font-varela_Round font-semibold text-black dark:text-white-dark mt-4'>Taxes</p>
                <div className="flex flex-col justify-between items-start mb-3 w-full">
                    {drawerReportData?.taxes?.map((tax: any, idx: any) => (
                        <div key={idx} className='flex justify-between items-center w-full pl-4' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}>
                            <p>{tax.taxName}</p>
                            <p>{formatCurrency(tax.taxAmount)}</p>
                        </div>
                    ))}
                    {/* <div className='flex justify-between items-center'><p>Cash Sales:</p><p>{formatCurrency(drawerReportData?.cashPayments)}</p></div>
                    <div className='flex justify-between items-center'><p>Taxed:</p><p>{formatCurrency(drawerReportData?.otherPayments)}</p></div>
                    <div className='flex justify-between items-center'><p>Sales Tax:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div> */}
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Tax Total:</p><p>{formatCurrency(drawerReportData?.taxTotal)}</p></div>
                </div>
                <div className="flex flex-col justify-between items-start mb-3 w-full">
                    {/* <div className='flex justify-between items-center'><p>Net Cash:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div>
                    <div className='flex justify-between items-center'><p>Net Card Payments:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div>
                    <div className='flex justify-between items-center'><p>Net Other Payments:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div> */}
                    <div className='flex justify-between items-center w-full' style={{fontSize: `${drawerPrintSettingData?.fontSize}px`}}><p>Net Sales:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div>
                </div>
            </div>
            </div>
        </div>
    );
}

export default DrawerPrint;
