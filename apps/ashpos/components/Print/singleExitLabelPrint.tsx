import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';

import { useReactToPrint } from 'react-to-print';
import { quantityAbbreviations, quantityTypes } from '@/utils/variables';
import { usePrintSettingByDispensaryIdQuery, useExitLabelByOrderIdQuery, useExitLabelByPackageLabelQuery, useTotalTestResultByMetrcPackageIdQuery } from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
import warnAlert from '../notification/warnAlert';
import { FaPrint } from 'react-icons/fa';

type StateSetter<T> = Dispatch<SetStateAction<T>>;

function SingleExitLabelPrint({
    packageLabel,
    packageId,
    text,
    className,
    printButtonRef,
    onAfterPrint,
}: {
    packageLabel: string;
    packageId: number;
    text: string;
    className: string;
    printButtonRef: React.RefObject<HTMLDivElement>;
    onAfterPrint: () => void;
}) {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;

    // console.log("packageLabel", packageLabel)
    // Query
    const printSettingRowData = usePrintSettingByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const printSettingData = printSettingRowData.data?.printSettingByDispensaryId;

    const exitLabelRowData = useExitLabelByPackageLabelQuery({ packageLabel: packageLabel });
    const exitLabelData = exitLabelRowData.data?.exitLabelByPackageLabel;

    const testResultRowData = useTotalTestResultByMetrcPackageIdQuery({ dispensaryId: dispensaryId, packageId: packageId });
    const testResultData = testResultRowData.data?.totalTestResultByMetrcPackageId;

    // console.log("testResultData", testResultData)

    // console.log("exitLabelData", exitLabelData)

    // console.log("exitLabelData", exitLabelData)
    // console.log("exitLabelData.OrderItem.package", exitLabelData?.OrderItem?.[0]?.package)

    // const exitLabelPrintSettingData = printSettingData?.filter((item) => item?.printType === 'exitLabel')[0];
    const exitLabelPrintSettingData = printSettingData?.find((item) => item?.printType === 'exitLabel') || null;

    // console.log('exitLabelData.isLoading >>>>>>>>>>>>>', exitLabelRowData.isLoading);
    // useEffect(() => {
    //     console.log('exitLabelRowData.isLoading', exitLabelRowData.isLoading);
    //     console.log('testResultRowData.isLoading', testResultRowData.isLoading);
    //     setIsPrintLoading(exitLabelRowData.isLoading);
    //     // if(!exitLabelRowData.isLoading && !testResultRowData.isLoading) {
    //     // }
    // }, [exitLabelRowData.isLoading]);

    // console.log("exitLabelPrintSettingData", exitLabelPrintSettingData)

    const packageLabelContentRef = useRef<HTMLDivElement>(null);
    const handlePackageExitLabelPrint = useReactToPrint({
        contentRef: packageLabelContentRef,
        // Dynamic page style with dimensions, margins, and font size
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&display=swap');
            @page {
                size: ${exitLabelPrintSettingData?.dimensionWidth ? exitLabelPrintSettingData?.dimensionWidth + 'in' : 'auto'} ${
            exitLabelPrintSettingData?.dimensionHeight ? exitLabelPrintSettingData?.dimensionHeight + 'in' : 'auto'
        };
                margin: ${exitLabelPrintSettingData?.marginTop ? exitLabelPrintSettingData?.marginTop + 'in' : '0'} ${
            exitLabelPrintSettingData?.marginRight ? exitLabelPrintSettingData?.marginRight + 'in' : '0'
        } ${exitLabelPrintSettingData?.marginBottom ? exitLabelPrintSettingData?.marginBottom + 'in' : '0'} ${
            exitLabelPrintSettingData?.marginLeft ? exitLabelPrintSettingData?.marginLeft + 'in' : '0'
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
                    font-size: ${exitLabelPrintSettingData?.fontSize ? exitLabelPrintSettingData?.fontSize + 'px' : '14px'};
                }
            }
        `,
        onAfterPrint: () => {
            console.log('Print completed');
            onAfterPrint();
        },
    });

    // Function to trigger automatic printing
    const triggerAutomaticPrint = () => {
        if (exitLabelPrintSettingData) {
            // Small delay to ensure content is ready
            setTimeout(() => {
                handlePackageExitLabelPrint();
                // Automatically close print dialog after 1 second
                setTimeout(() => {
                    try {
                        window.close();
                    } catch (error) {
                        console.log('Could not close window automatically');
                    }
                }, 1000);
            }, 100);
        } else {
            warnAlert('Failed to Fetch Print Setting');
        }
    };

    // Auto-trigger print when component mounts
    // React.useEffect(() => {
    //     triggerAutomaticPrint();
    // }, [exitLabelPrintSettingData, exitLabelData]);

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
            <div className={`relative ${className} ${testResultRowData.isLoading ? 'text-gray-200 dark:text-gray-700' : ''}`} onClick={() => {
                if (testResultRowData.isLoading) return;
                handlePackageExitLabelPrint()
                }} ref={printButtonRef}>
                <FaPrint className="mr-1" />
                &nbsp;{text || 'Print Order Data'}
                {testResultRowData.isLoading ? (
                    <div role="status" className="ml-2">
                        <svg aria-hidden="true" className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                    </div>
                ) : null}
            </div>
            <div className="hidden">
                <div
                    className="bg-white dark:bg-black p-4 rounded"
                    style={{
                        width: exitLabelPrintSettingData?.dimensionWidth ? `${exitLabelPrintSettingData.dimensionWidth}in` : '200px',
                        height: exitLabelPrintSettingData?.dimensionHeight ? `${exitLabelPrintSettingData.dimensionHeight}in` : '100%',
                    }}
                    ref={packageLabelContentRef}
                >
                    <div
                        className="text-xs"
                        style={{
                            breakAfter: 'page',
                            pageBreakAfter: 'always',
                            fontFamily: 'Open Sans, Roboto, Arial, sans-serif',
                            fontSize: exitLabelPrintSettingData?.fontSize ? exitLabelPrintSettingData?.fontSize + 'pt' : '14pt',
                            marginTop: exitLabelPrintSettingData?.marginTop ? exitLabelPrintSettingData?.marginTop + 'in' : '0',
                            marginRight: exitLabelPrintSettingData?.marginRight ? exitLabelPrintSettingData?.marginRight + 'in' : '0',
                            marginBottom: exitLabelPrintSettingData?.marginBottom ? exitLabelPrintSettingData?.marginBottom + 'in' : '0',
                            marginLeft: exitLabelPrintSettingData?.marginLeft ? exitLabelPrintSettingData?.marginLeft + 'in' : '0',
                        }}
                    >
                        <p className="font-bold">{exitLabelData?.itemName}</p>
                        <p>
                            MJ Weight: {exitLabelData?.itemUnitWeight} {quantityAbbreviations[exitLabelData?.itemUnitWeightUnitOfMeasureName ?? '']}
                        </p>
                        <p>Supplier: {exitLabelData?.ItemFromFacilityName}</p>
                        <p>Supplier License: {exitLabelData?.ItemFromFacilityLicenseNumber}</p>
                        <p>Tested Date: {formatDate(exitLabelData?.LabTestingStateDate)}</p>
                        {/* Add more fields as needed */}
                        {/* <p className='font-bold'>{exitLabelPrintSettingData?.bottomText || ''}</p> */}
                        <div className="">
                            {testResultData?.map((item) => (
                                <span key={item?.testTypeName}>
                                    {item?.testTypeName}: {item?.testResultLevel}%&nbsp;
                                </span>
                            ))}
                        </div>
                        <p className="font-bold">{exitLabelPrintSettingData?.bottomText || ''}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SingleExitLabelPrint;
