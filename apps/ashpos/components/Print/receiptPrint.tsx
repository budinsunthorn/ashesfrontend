import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { quantityAbbreviations, quantityTypes } from '@/utils/variables';
import { usePrintSettingByDispensaryIdQuery, useReceiptByOrderIdQuery } from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
import warnAlert from '../notification/warnAlert';
import { FaPrint } from 'react-icons/fa';
import Barcode from 'react-barcode';
import { truncateToTwoDecimals } from '@/lib/utils';



function ReceiptPrint({ isCompleteOrder, orderId, text, className, printButtonRef, onAfterPrint }: { isCompleteOrder: boolean, orderId: number; text: string, className: string, printButtonRef: React.RefObject<HTMLDivElement>, onAfterPrint: () => void  }) {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const receiptContentRef = useRef<HTMLDivElement>(null);

    // Query
    const printSettingRowData = usePrintSettingByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const printSettingData = printSettingRowData.data?.printSettingByDispensaryId;

    const receiptRowData = useReceiptByOrderIdQuery({ orderId: orderId });
    const receiptData = receiptRowData.data?.receiptByOrderId;

    // console.log('receiptData', receiptData);

    // const receiptPrintSettingData = printSettingData?.filter((item) => item?.printType === 'exitLabel')[0];
    const receiptPrintSettingData = printSettingData?.find((item) => item?.printType === 'receipt') || null;

    // console.log('receiptPrintSettingData', receiptPrintSettingData);

    const order = receiptData?.order;

    // Format currency helper
    const formatCurrency = (amount: number) => `$${truncateToTwoDecimals(amount)}`;

    // Calculate subtotal from items (price * quantity)
    // const subtotal = order?.OrderItem?.reduce((acc, item) => acc + (item?.price || 0) * (item?.quantity || 0), 0);
    const subTotal = order?.OrderItem?.reduce((acc, item) => {
        let val = acc + (item?.price || 0) * (item?.quantity || 0);
        val = Number(truncateToTwoDecimals(val));
        return val;
    }, 0);

    const loyaltyEarn = order?.LoyaltyHistory?.reduce((acc, item) => {
        if (item?.txType === 'earn') {
            return acc + (item?.value || 0);
        }
        return acc;
    }, 0);

    // Calculate total discount from discountedAmount or discount field
    const totalDiscount = order?.discount || order?.OrderItem?.reduce((acc, item) => acc + (item?.discountedAmount || 0), 0);

    // Tax included in total (order.tax)
    const tax = order?.tax || 0;

    // Total = subtotal - discount + tax (tax included so just subtotal - discount)
    const total = (subTotal || 0) - (totalDiscount || 0);

    const packageLabelContentRef = useRef<HTMLDivElement>(null);
    const handlePackageReceipPrint = useReactToPrint({
        contentRef: packageLabelContentRef,
        // Dynamic page style with dimensions, margins, and font size
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            @page {
                size: ${receiptPrintSettingData?.dimensionWidth ? receiptPrintSettingData?.dimensionWidth + 'in' : 'auto'} ${
            receiptPrintSettingData?.dimensionHeight ? receiptPrintSettingData?.dimensionHeight + 'in' : 'auto'
        };
                margin: ${receiptPrintSettingData?.marginTop ? receiptPrintSettingData?.marginTop + 'in' : '0'} ${
            receiptPrintSettingData?.marginRight ? receiptPrintSettingData?.marginRight + 'in' : '0'
        } ${receiptPrintSettingData?.marginBottom ? receiptPrintSettingData?.marginBottom + 'in' : '0'} ${
            receiptPrintSettingData?.marginLeft ? receiptPrintSettingData?.marginLeft + 'in' : '0'
        };
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', Arial, sans-serif !important;
                }
                * {
                    box-sizing: border-box;
                    font-size: ${receiptPrintSettingData?.fontSize ? receiptPrintSettingData?.fontSize + 'px' : '14px'};
                }
            }
        `,
        onAfterPrint: () => {
            // console.log('Print completed');
            onAfterPrint();
        }
    });

    const handlePrint = () => {
        if (window.electronAPI) {
            // Extract HTML for silent printing
            const htmlContent = `
                <html>
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                        body { 
                            font-family: 'Roboto', Arial, sans-serif; 
                            margin: 0;
                            padding: 0;
                            font-size: ${receiptPrintSettingData?.fontSize ? `${receiptPrintSettingData.fontSize}pt` : '14pt'};
                        }
                        .print-content {
                            width: ${receiptPrintSettingData?.dimensionWidth ? `${receiptPrintSettingData.dimensionWidth}in` : 'auto'};
                            height: ${receiptPrintSettingData?.dimensionHeight ? `${receiptPrintSettingData.dimensionHeight}in` : 'auto'};
                            margin: ${receiptPrintSettingData?.marginTop ? `${receiptPrintSettingData.marginTop}in` : '0'} ${receiptPrintSettingData?.marginRight ? `${receiptPrintSettingData.marginRight}in` : '0'} ${receiptPrintSettingData?.marginBottom ? `${receiptPrintSettingData.marginBottom}in` : '0'} ${receiptPrintSettingData?.marginLeft ? `${receiptPrintSettingData.marginLeft}in` : '0'};
                        }
                    </style>
                </head>
                <body>
                    <div class="print-content">
                        ${receiptContentRef.current?.outerHTML || ''}
                    </div>
                </body>
                </html>
            `;
            
            // Use the existing printSilently function if available
            if (window.electronAPI.printSilently) {
                window.electronAPI.printSilently({
                    content: htmlContent,
                    fontSize: receiptPrintSettingData?.fontSize ? `${receiptPrintSettingData.fontSize}px` : '14px',
                    dimensionWidth: receiptPrintSettingData?.dimensionWidth ? `${receiptPrintSettingData.dimensionWidth}in` : undefined,
                    dimensionHeight: receiptPrintSettingData?.dimensionHeight ? `${receiptPrintSettingData.dimensionHeight}in` : undefined,
                    marginTop: receiptPrintSettingData?.marginTop ? `${receiptPrintSettingData.marginTop}in` : undefined,
                    marginRight: receiptPrintSettingData?.marginRight ? `${receiptPrintSettingData.marginRight}in` : undefined,
                    marginBottom: receiptPrintSettingData?.marginBottom ? `${receiptPrintSettingData.marginBottom}in` : undefined,
                    marginLeft: receiptPrintSettingData?.marginLeft ? `${receiptPrintSettingData.marginLeft}in` : undefined,
                }).then((result: any) => {
                    if (result.success) {
                        // console.log('Silent print completed successfully');
                        onAfterPrint();
                    } else {
                        // console.error('Silent print failed:', result.error);
                        warnAlert(`Print failed: ${result.error}`);
                    }
                }).catch((error: any) => {
                    // console.error('Silent print error:', error);
                    warnAlert('Print failed. Please try again.');
                });
            } else {
                // Fallback for older Electron API
                window.electronAPI?.printReceipt?.(htmlContent);
            }
        } else {
            // Fallback: normal browser print
            // console.log("fallback printFunc");
            handlePackageReceipPrint();
        }
    };

    useEffect(() => {
        if(isCompleteOrder){
            receiptRowData.refetch()
            // console.log("isCompletOrder >>>>>>", isCompleteOrder)
        }
    }, [isCompleteOrder])

    // Expose the print function through the ref
    React.useEffect(() => {
        if (printButtonRef.current) {
            (printButtonRef.current as any).print = handlePrint;
        }
    }, [handlePrint]);

    // Auto-trigger print when component mounts
    // React.useEffect(() => {
    //     triggerAutomaticPrint();
    // }, [receiptPrintSettingData, receiptData]);

    // Helper for date formatting
    const formatDate = (isoDateString: any) => {
        if (!isoDateString) return '';
        const date = new Date(isoDateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    return (
        <div>
            <div
                ref={printButtonRef}
                className={`relative ${className} ${receiptRowData.isLoading ? 'text-gray-200 dark:text-gray-700' : ''}`} onClick={() => {
                    if (receiptRowData.isLoading) return; 
                    handlePrint();
                }}
                data-print-function={`(${handlePrint.toString()})()`}
            >   <FaPrint className="mr-1" />
                &nbsp;
                {text || 'Print Order Data'}
                {receiptRowData.isLoading ? (
                    <div role="status" className="ml-2">
                        <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                    </div>
                ) : null}
            </div>
            <div className="hidden">
                <div 
                    className="bg-white dark:bg-black p-4 rounded"
                    style={{
                        width: receiptPrintSettingData?.dimensionWidth ? `${receiptPrintSettingData.dimensionWidth}in` : '200px',
                        height: receiptPrintSettingData?.dimensionHeight ? `${receiptPrintSettingData.dimensionHeight}in` : '100%',
                        margin: receiptPrintSettingData?.marginLeft ? `${receiptPrintSettingData.marginLeft}in` : '0',
                        marginRight: receiptPrintSettingData?.marginRight ? `${receiptPrintSettingData.marginRight}in` : '0',
                        marginTop: receiptPrintSettingData?.marginTop ? `${receiptPrintSettingData.marginTop}in` : '0',
                        marginBottom: receiptPrintSettingData?.marginBottom ? `${receiptPrintSettingData.marginBottom}in` : '0',
                        marginLeft: receiptPrintSettingData?.marginLeft ? `${receiptPrintSettingData.marginLeft}in` : '0',
                        fontSize: receiptPrintSettingData?.fontSize ? `${receiptPrintSettingData.fontSize}pt` : '14px',
                        // fontFamily: 'Roboto, Arial, sans-serif !important',
                    }}
                    ref={packageLabelContentRef}>
                    {/* Address */}
                    <div className="text-center mb-4">
                        <h1 className="text-xl font-bold text-nowrap">{userData.storeName}</h1>
                        <div>{order?.dispensary?.locationAddress}</div>
                        <div>
                            {order?.dispensary?.locationCity}, {order?.dispensary?.locationState}, {order?.dispensary?.locationZipCode}
                        </div>
                        <div>{order?.dispensary?.phone}</div>
                    </div>

                    {/* Store and Customer Info */}
                    <div className="mb-4">
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Store # </p>
                            <p>{order?.dispensary?.cannabisLicense}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Order # </p>
                            <p>{order?.id.toString()}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Customer - </p>
                            <p>{order?.customer?.name}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Customer Type - </p>
                            <p>Medical</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Patient # - </p>
                            <p>{order?.customer?.medicalLicense}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Loyalty Points Earned - </p>
                            <p>{loyaltyEarn}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Current Loyalty Points - </p>
                            {/* Assuming current loyalty points is loyalty + earned */}
                            <p>{order?.customer?.loyaltyPoints?.toFixed(0)}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mb-4">
                        {order?.OrderItem?.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                                <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}}>
                                    {item?.quantity} {item?.product?.name}
                                    <div className="text-xs text-gray-600">{item?.package.packageLabel?.slice(-10)}</div>
                                </div>
                                <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}}   className="flex flex-col justify-end  item-end text-right">
                                    <div>{formatCurrency(item?.amount || 0)}</div>
                                    {item?.discountedAmount && item?.discountedAmount > 0 ? <div className="text-red-600 text-xs">-{formatCurrency(item?.discountedAmount)}</div> : ''}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="flex flex-col justify-between items-end border-t border-gray-300 pt-2 mb-4 text-right space-y-1">
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">SUBTOTAL:</span><span className='text-right w-16 ml-2'>{subTotal == 0 ? '' : formatCurrency(subTotal || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">DISCOUNT:</span><span className='text-right w-16 ml-2'>{totalDiscount == 0 ? '' : '-' + formatCurrency(totalDiscount || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">TAX (included):</span><span className='text-right w-16 ml-2'>{tax == 0 ? '' : formatCurrency(tax || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className="flex justify-end items-center font-bold text-lg">
                            <span className="font-semibold font-roboto text-left">TOTAL:</span><span className='text-right w-16 ml-2'>{formatCurrency(total || 0)}</span>   
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">CASH:</span><span className='text-right w-16 ml-2'>{formatCurrency(order?.cashAmount || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">CHANGE:</span><span className='text-right w-16 ml-2'>{formatCurrency(order?.changeDue || 0)}</span>
                        </div>
                    </div>
                    <div className='w-full flex justify-center'>
                        <Barcode value={order?.id.toString() || ''} width={1} height={30} fontSize={12}/>
                    </div>
                </div>
            </div>
            
            {/* Hidden print content for silent printing */}
            <div style={{ display: 'none' }}>
                <div 
                    className="bg-white dark:bg-black p-4 rounded"
                    style={{
                        width: receiptPrintSettingData?.dimensionWidth ? `${receiptPrintSettingData.dimensionWidth}in` : '200px',
                        height: receiptPrintSettingData?.dimensionHeight ? `${receiptPrintSettingData.dimensionHeight}in` : '100%',
                        margin: receiptPrintSettingData?.marginLeft ? `${receiptPrintSettingData.marginLeft}in` : '0',
                        marginRight: receiptPrintSettingData?.marginRight ? `${receiptPrintSettingData.marginRight}in` : '0',
                        marginTop: receiptPrintSettingData?.marginTop ? `${receiptPrintSettingData.marginTop}in` : '0',
                        marginBottom: receiptPrintSettingData?.marginBottom ? `${receiptPrintSettingData.marginBottom}in` : '0',
                        marginLeft: receiptPrintSettingData?.marginLeft ? `${receiptPrintSettingData.marginLeft}in` : '0',
                        fontSize: receiptPrintSettingData?.fontSize ? `${receiptPrintSettingData.fontSize}pt` : '14px',
                    }}
                    ref={receiptContentRef}>
                    {/* Address */}
                    <div className="text-center mb-4">
                        <h1 className="text-xl font-bold text-nowrap">{userData.storeName}</h1>
                        <div>{order?.dispensary?.locationAddress}</div>
                        <div>
                            {order?.dispensary?.locationCity}, {order?.dispensary?.locationState}, {order?.dispensary?.locationZipCode}
                        </div>
                        <div>{order?.dispensary?.phone}</div>
                    </div>

                    {/* Store and Customer Info */}
                    <div className="mb-4">
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Store # </p>
                            <p>{order?.dispensary?.cannabisLicense}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Order # </p>
                            <p>{order?.id.toString()}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Customer - </p>
                            <p>{order?.customer?.name}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Customer Type - </p>
                            <p>Medical</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Patient # - </p>
                            <p>{order?.customer?.medicalLicense}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Loyalty Points Earned - </p>
                            <p>{loyaltyEarn}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Current Loyalty Points - </p>
                            {/* Assuming current loyalty points is loyalty + earned */}
                            <p>{order?.customer?.loyaltyPoints?.toFixed(0)}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mb-4">
                        {order?.OrderItem?.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                                <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}}>
                                    {item?.quantity} {item?.product.name}
                                    <div className="text-xs text-gray-600">{item?.package.packageLabel?.slice(-10)}</div>
                                </div>
                                <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}}   className="flex flex-col justify-end  item-end text-right">
                                    <div>{formatCurrency(item?.amount || 0)}</div>
                                    {item?.discountedAmount && item?.discountedAmount > 0 ? <div className="text-red-600 text-xs">-{formatCurrency(item?.discountedAmount)}</div> : ''}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="flex flex-col justify-between items-end border-t border-gray-300 pt-2 mb-4 text-right space-y-1">
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">SUBTOTAL:</span><span className='text-right w-16 ml-2'>{subTotal == 0 ? '' : formatCurrency(subTotal || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">DISCOUNT:</span><span className='text-right w-16 ml-2'>{totalDiscount == 0 ? '' : '-' + formatCurrency(totalDiscount || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">TAX (included):</span><span className='text-right w-16 ml-2'>{tax == 0 ? '' : formatCurrency(tax || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className="flex justify-end items-center font-bold text-lg">
                            <span className="font-semibold font-roboto text-left">TOTAL:</span><span className='text-right w-16 ml-2'>{formatCurrency(total || 0)}</span>   
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">CASH:</span><span className='text-right w-16 ml-2'>{formatCurrency(order?.cashAmount || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">CHANGE:</span><span className='text-right w-16 ml-2'>{formatCurrency(order?.changeDue || 0)}</span>
                        </div>
                    </div>
                    <div className='w-full flex justify-center'>
                        <Barcode value={order?.id.toString() || ''} width={1} height={30} fontSize={12}/>
                    </div>
                </div>
            </div>
            
            {/* Hidden print content for silent printing */}
            <div style={{ display: 'none' }}>
                <div 
                    className="bg-white dark:bg-black p-4 rounded"
                    style={{
                        width: receiptPrintSettingData?.dimensionWidth ? `${receiptPrintSettingData.dimensionWidth}in` : '200px',
                        height: receiptPrintSettingData?.dimensionHeight ? `${receiptPrintSettingData.dimensionHeight}in` : '100%',
                        margin: receiptPrintSettingData?.marginLeft ? `${receiptPrintSettingData.marginLeft}in` : '0',
                        marginRight: receiptPrintSettingData?.marginRight ? `${receiptPrintSettingData.marginRight}in` : '0',
                        marginTop: receiptPrintSettingData?.marginTop ? `${receiptPrintSettingData.marginTop}in` : '0',
                        marginBottom: receiptPrintSettingData?.marginBottom ? `${receiptPrintSettingData.marginBottom}in` : '0',
                        marginLeft: receiptPrintSettingData?.marginLeft ? `${receiptPrintSettingData.marginLeft}in` : '0',
                        fontSize: receiptPrintSettingData?.fontSize ? `${receiptPrintSettingData.fontSize}pt` : '14px',
                    }}
                    ref={receiptContentRef}>
                    {/* Address */}
                    <div className="text-center mb-4">
                        <h1 className="text-xl font-bold text-nowrap">{userData.storeName}</h1>
                        <div>{order?.dispensary?.locationAddress}</div>
                        <div>
                            {order?.dispensary?.locationCity}, {order?.dispensary?.locationState}, {order?.dispensary?.locationZipCode}
                        </div>
                        <div>{order?.dispensary?.phone}</div>
                    </div>

                    {/* Store and Customer Info */}
                    <div className="mb-4">
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Store # </p>
                            <p>{order?.dispensary?.cannabisLicense}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Order # </p>
                            <p>{order?.id.toString()}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Customer - </p>
                            <p>{order?.customer?.name}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Customer Type - </p>
                            <p>Medical</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Patient # - </p>
                            <p>{order?.customer?.medicalLicense}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Loyalty Points Earned - </p>
                            <p>{loyaltyEarn}</p>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-between items-center'>
                            <p className="font-semibold font-roboto">Current Loyalty Points - </p>
                            {/* Assuming current loyalty points is loyalty + earned */}
                            <p>{order?.customer?.loyaltyPoints?.toFixed(0)}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mb-4">
                        {order?.OrderItem?.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                                <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}}>
                                    {item?.quantity} {item?.product.name}
                                    <div className="text-xs text-gray-600">{item?.package.packageLabel?.slice(-10)}</div>
                                </div>
                                <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}}   className="flex flex-col justify-end  item-end text-right">
                                    <div>{formatCurrency(item?.amount || 0)}</div>
                                    {item?.discountedAmount && item?.discountedAmount > 0 ? <div className="text-red-600 text-xs">-{formatCurrency(item?.discountedAmount)}</div> : ''}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="flex flex-col justify-between items-end border-t border-gray-300 pt-2 mb-4 text-right space-y-1">
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">SUBTOTAL:</span><span className='text-right w-16 ml-2'>{subTotal == 0 ? '' : formatCurrency(subTotal || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">DISCOUNT:</span><span className='text-right w-16 ml-2'>{totalDiscount == 0 ? '' : '-' + formatCurrency(totalDiscount || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">TAX (included):</span><span className='text-right w-16 ml-2'>{tax == 0 ? '' : formatCurrency(tax || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className="flex justify-end items-center font-bold text-lg">
                            <span className="font-semibold font-roboto text-left">TOTAL:</span><span className='text-right w-16 ml-2'>{formatCurrency(total || 0)}</span>   
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">CASH:</span><span className='text-right w-16 ml-2'>{formatCurrency(order?.cashAmount || 0)}</span>
                        </div>
                        <div style={{fontSize: `${receiptPrintSettingData?.fontSize}pt`}} className='flex justify-end items-center'>
                            <span className="font-semibold font-roboto text-left">CHANGE:</span><span className='text-right w-16 ml-2'>{formatCurrency(order?.changeDue || 0)}</span>
                        </div>
                    </div>
                    <div className='w-full flex justify-center'>
                        <Barcode value={order?.id.toString() || ''} width={1} height={30} fontSize={12}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReceiptPrint;
