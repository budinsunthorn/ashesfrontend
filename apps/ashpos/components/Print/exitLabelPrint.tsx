import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { quantityAbbreviations, quantityTypes } from '@/utils/variables';
import { usePrintSettingByDispensaryIdQuery, useExitLabelByOrderIdQuery, useTotalTestResultByMetrcPackageIdQuery, useTotalTestResultByOrderIdQuery } from "@/src/__generated__/operations";
import { userDataSave } from '@/store/userData';
import warnAlert from '../notification/warnAlert';
import { FaPrint } from 'react-icons/fa';



// Helper for date formatting
const formatDate = (isoDateString: any) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};

interface ExitLabelProps {
    exitLabelData: any;
    testResultData: any;
    exitLabelPrintSettingData: any;
}

const ExitLabel = React.forwardRef<HTMLDivElement, ExitLabelProps>(({ exitLabelData, testResultData, exitLabelPrintSettingData }, ref) => {
    if (!exitLabelData?.OrderItem || exitLabelData.OrderItem.length === 0) {
        return (
            <div ref={ref} style={{ padding: '20px', fontFamily: 'monospace' }}>
                <p>No package data found.</p>
            </div>
        );
    }

    return (
        <div 
            ref={ref} 
            style={{
                padding: '0px',
                fontFamily: exitLabelPrintSettingData?.fontFamily ? `${exitLabelPrintSettingData?.fontFamily}` : 'Open Sans, Roboto, Arial, sans-serif',
                fontSize: exitLabelPrintSettingData?.fontSize ? `${exitLabelPrintSettingData.fontSize}pt` : '14pt',
                width: exitLabelPrintSettingData?.dimensionWidth ? `${exitLabelPrintSettingData.dimensionWidth}in` : 'auto',
                height: exitLabelPrintSettingData?.dimensionHeight ? `${exitLabelPrintSettingData.dimensionHeight}in` : 'auto',
                marginTop: exitLabelPrintSettingData?.marginTop ? `${exitLabelPrintSettingData.marginTop}in` : '0',
                marginRight: exitLabelPrintSettingData?.marginRight ? `${exitLabelPrintSettingData.marginRight}in` : '0',
                marginBottom: exitLabelPrintSettingData?.marginBottom ? `${exitLabelPrintSettingData.marginBottom}in` : '0',
                marginLeft: exitLabelPrintSettingData?.marginLeft ? `${exitLabelPrintSettingData.marginLeft}in` : '0'
            }}
        >
            {exitLabelData.OrderItem.filter((item: any) => item.package?.packageId > 0).flatMap((item: any, idx: number) => {
                const unit = item.package?.UnitOfMeasureName;
                const unitType = quantityTypes[unit] || '';
                let pages = 1;
                let quantity = item.quantity;
                if(unitType === 'CountBased') {
                    pages = item.quantity;
                    quantity = item.package.itemUnitWeight;
                }
                
                return Array.from({length: pages}).map((_, pageIdx) => (
                    <div key={`${idx}-${pageIdx}`} style={{
                        breakAfter: 'page',
                        pageBreakAfter: 'always',
                        marginBottom: '10px'
                    }}>
                        <p style={{ fontWeight: 'bold' }}>{item.package?.itemName}</p>
                        <p>MJ Weight: {quantity} {quantityAbbreviations[item.package?.itemUnitWeightUnitOfMeasureName ?? unit]}</p>
                        <p>Supplier: {item.package?.ItemFromFacilityName}</p>
                        <p>Supplier License: {item.package?.ItemFromFacilityLicenseNumber}</p>
                        <p>Tested Date: {formatDate(item.package?.LabTestingStateDate)}</p>
                        <p>Customer Medical License: {exitLabelData.customer?.medicalLicense || '-'}</p>
                        
                        {/* Test Results */}
                        <div>
                            {testResultData?.map((data: any) => {
                                if ((data?.packageId === item.package.packageId) && data?.labTest) {
                                    return data.labTest.map((test: any) => (
                                        test && <span key={test.testTypeName} style={{ marginRight: '10px' }}>
                                            {test.testTypeName}: {test.testResultLevel}%
                                        </span>
                                    ));
                                }
                                return null;
                            })}
                        </div>
                        
                        <p style={{ fontWeight: 'bold', marginTop: '10px' }}>
                            {exitLabelPrintSettingData?.bottomText || ''}
                        </p>
                    </div>
                ));
            })}
        </div>
    );
});

ExitLabel.displayName = 'ExitLabel';

export default function ExitLabelPrint({orderId, text, className, printButtonRef, onAfterPrint}: {
    orderId: number, 
    text: string, 
    className: string, 
    printButtonRef: React.RefObject<HTMLDivElement>, 
    onAfterPrint: () => void
}) {
    const {userData} = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const exitLabelRef = useRef<HTMLDivElement>(null);
    const isPrinted = useRef(false);

    // Query
    const printSettingRowData = usePrintSettingByDispensaryIdQuery({dispensaryId: dispensaryId});
    const printSettingData = printSettingRowData.data?.printSettingByDispensaryId;

    const exitLabelRowData = useExitLabelByOrderIdQuery({orderId: orderId});
    const exitLabelData = exitLabelRowData.data?.exitLabelByOrderId;

    const testResultRowData = useTotalTestResultByOrderIdQuery({dispensaryId: dispensaryId, orderId: orderId});
    const testResultData = testResultRowData.data?.totalTestResultByOrderId;

    const exitLabelPrintSettingData = printSettingData?.find((item) => item?.printType === 'exitLabel') || null;

    useEffect(() => {
        if (!isPrinted && exitLabelData) {
            console.log("========= Retrigger Print =========");
            handlePrint();
        }
    }, [exitLabelData, isPrinted]);

    console.log("exitLabelPrintSettingData?.fontFamily", exitLabelPrintSettingData?.fontFamily)

    const printFunc = useReactToPrint({
        contentRef: exitLabelRef,
        documentTitle: 'Exit Label',
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&display=swap');
            @page {
                size: ${exitLabelPrintSettingData?.dimensionWidth ? exitLabelPrintSettingData?.dimensionWidth + 'in' : 'auto'} ${exitLabelPrintSettingData?.dimensionHeight ? exitLabelPrintSettingData?.dimensionHeight + 'in' : 'auto'};
                margin: ${exitLabelPrintSettingData?.marginTop ? exitLabelPrintSettingData?.marginTop + 'in' : '0'} ${exitLabelPrintSettingData?.marginRight ? exitLabelPrintSettingData?.marginRight + 'in' : '0'} ${exitLabelPrintSettingData?.marginBottom ? exitLabelPrintSettingData?.marginBottom + 'in' : '0'} ${exitLabelPrintSettingData?.marginLeft ? exitLabelPrintSettingData?.marginLeft + 'in' : '0'};
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-family: ${exitLabelPrintSettingData?.fontFamily ? `${exitLabelPrintSettingData?.fontFamily}` : 'roboto' }, Arial, sans-serif !important;
                }
                * {
                    box-sizing: border-box;
                    font-size: ${exitLabelPrintSettingData?.fontSize ? exitLabelPrintSettingData?.fontSize + 'px' : '14px'};
                }
            }
        `,
        onAfterPrint: () => {
            console.log('Print completed');
            isPrinted.current = true;
            onAfterPrint();
        }
    });

    const handlePrint = () => {
        console.log("exit label handlePrint");
        if (window.electronAPI) {
            // Extract HTML for silent printing
            const htmlContent = `
                <html>
                <head>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&display=swap');
                        body { 
                            font-family: 'Open Sans', 'Roboto', Arial, sans-serif; 
                            margin: 0;
                            padding: 0;
                            font-size: ${exitLabelPrintSettingData?.fontSize ? `${exitLabelPrintSettingData.fontSize}pt` : '14pt'};
                            font-family: ${exitLabelPrintSettingData?.fontFamily ? `${exitLabelPrintSettingData?.fontFamily}` : 'roboto' }
                        }
                        .print-content {
                            width: ${exitLabelPrintSettingData?.dimensionWidth ? `${exitLabelPrintSettingData.dimensionWidth}in` : 'auto'};
                            height: ${exitLabelPrintSettingData?.dimensionHeight ? `${exitLabelPrintSettingData.dimensionHeight}in` : 'auto'};
                            margin: ${exitLabelPrintSettingData?.marginTop ? `${exitLabelPrintSettingData.marginTop}in` : '0'} ${exitLabelPrintSettingData?.marginRight ? `${exitLabelPrintSettingData.marginRight}in` : '0'} ${exitLabelPrintSettingData?.marginBottom ? `${exitLabelPrintSettingData.marginBottom}in` : '0'} ${exitLabelPrintSettingData?.marginLeft ? `${exitLabelPrintSettingData.marginLeft}in` : '0'};
                        }
                        .page-break {
                            page-break-after: always;
                            break-after: page;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-content">
                        ${exitLabelRef.current?.outerHTML || ''}
                    </div>
                </body>
                </html>
            `;
            
            // Use the existing printSilently function if available
            if (window.electronAPI.printSilently) {
                console.log("printSilently");
                window.electronAPI.printSilently({
                    content: htmlContent,
                    fontSize: exitLabelPrintSettingData?.fontSize ? `${exitLabelPrintSettingData.fontSize}px` : '14px',
                    fontFamily: exitLabelPrintSettingData?.fontFamily ? `${exitLabelPrintSettingData?.fontFamily}` : 'roboto',
                    dimensionWidth: exitLabelPrintSettingData?.dimensionWidth ? `${exitLabelPrintSettingData.dimensionWidth}in` : undefined,
                    dimensionHeight: exitLabelPrintSettingData?.dimensionHeight ? `${exitLabelPrintSettingData.dimensionHeight}in` : undefined,
                    marginTop: exitLabelPrintSettingData?.marginTop ? `${exitLabelPrintSettingData.marginTop}in` : undefined,
                    marginRight: exitLabelPrintSettingData?.marginRight ? `${exitLabelPrintSettingData.marginRight}in` : undefined,
                    marginBottom: exitLabelPrintSettingData?.marginBottom ? `${exitLabelPrintSettingData.marginBottom}in` : undefined,
                    marginLeft: exitLabelPrintSettingData?.marginLeft ? `${exitLabelPrintSettingData.marginLeft}in` : undefined,
                }).then((result: any) => {
                    if (result.success) {
                        console.log('Silent print completed successfully');
                        isPrinted.current = true;
                        onAfterPrint();
                    } else {
                        console.error('Silent print failed:', result.error);
                        warnAlert(`Print failed: ${result.error}`);
                    }
                }).catch((error: any) => {
                    console.error('Silent print error:', error);
                    warnAlert('Print failed. Please try again.');
                });
            } else {
                // Fallback for older Electron API
                console.log("printReceipt with fallback Electron API");
                window.electronAPI?.printReceipt?.(htmlContent);
                isPrinted.current = true;
                onAfterPrint();
            }
        } else {
            // Fallback: normal browser print
            // console.log("fallback printFunc");
            console.log("Normal print");
            printFunc();
        }
    };

    return (
        <div>
            <div 
                className={`relative ${className} ${testResultRowData.isLoading ? 'text-gray-200 dark:text-gray-700' : ''}`} 
                onClick={() => {
                    if (testResultRowData.isLoading) return; 
                    handlePrint();
                }} 
                ref={printButtonRef}
            >
                <FaPrint className="mr-1" />
                &nbsp;{text || "Print Order Data"}
                {testResultRowData.isLoading ? (
                    <div role="status" className="ml-2">
                        <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                    </div>
                ) : null}
            </div>
            
            {/* Hidden print content */}
            <div style={{ display: 'none' }}>
                <ExitLabel 
                    ref={exitLabelRef}
                    exitLabelData={exitLabelData}
                    testResultData={testResultData}
                    exitLabelPrintSettingData={exitLabelPrintSettingData}
                />
            </div>
        </div>
    );
}