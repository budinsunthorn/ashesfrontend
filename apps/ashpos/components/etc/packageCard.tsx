'use client';
import React, { useState, Fragment, useEffect } from 'react';
import { userDataSave } from '@/store/userData';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import { TiWarningOutline } from 'react-icons/ti';
import { Transition, Dialog } from '@headlessui/react';
import Swal from 'sweetalert2';
import Dropdown from '@/components/dropdown';
import { getPackageStatusNameAsString, returnPackageStatusClass } from '@/utils/helper';
import { useRouter } from 'next/navigation';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import { RxCross1 } from 'react-icons/rx';
import { BiPrinter } from 'react-icons/bi';
import { FaAdjust, FaBarcode, FaClock, FaCopy } from 'react-icons/fa';
import { PiClockClockwiseFill, PiPackageFill } from 'react-icons/pi';
import { LuPackageCheck } from 'react-icons/lu';
import { TbPackages } from 'react-icons/tb';
import { useParams } from 'next/navigation';


import { useAdjustPackageMutation, useMetrcAdjustmentReasonsByDispensaryIdQuery, useFetchTestResultsByPackageIdMutation } from '@/src/__generated__/operations';
import { isElectron, navigateInElectron } from '@/utils/electronUtils';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import { calculateDaysBetweenDates, truncateToTwoDecimals } from '@/lib/utils';
import CopyButton from './copyButton';
import SingleExitLabelPrint from '../Print/singleExitLabelPrint';
import { Store } from 'react-notifications-component';

import { quantityAbbreviations } from '@/utils/variables';
import { GrConnect, GrDocumentTest } from 'react-icons/gr';
import { FaChevronDown } from 'react-icons/fa6';
import IconX from '../icon/icon-x';
import SinglePackageTransfer from './singlePackageTransfer';
import OrderStatusBadge from './OrderStatusBadge';

export default function PackageCard({ packageLabel, packageData, isLoading, handleActivePackage, handleHoldPackage, handleFinishPakcage, onAdjustPackage, handleFetchTestResult, handleRefetchPackage }: any) {
    const router = useRouter();
    const [hide, setHide] = useState(true);
    const currentDate = new Date().toISOString().split('T')[0];
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;
    const { organizationId, storeLinkName } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [salesHistory, setsalesHistory] = useState<any>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);

    console.log('packageData', packageData);

    // useEffect(() => {
    //     if (isUpdate) {
    //         handleRefetchPackage();
    //     }
    // }, [isUpdate]);

    useEffect(() => {
        // console.log(currentPage)
        const newOrders: any = []; // Temporary array to hold new orders

        for (let i = (currentPage - 1) * 5; i < currentPage * 5; i++) {
            if (packageData?.OrderItem && packageData?.OrderItem[i]) {
                newOrders.push(packageData?.OrderItem[i]); // Add the current order to the temporary array
            }
        }

        // Update the state with the new orders
        setsalesHistory(newOrders);
    }, [currentPage, packageData]);
    // const [isPrintDataLoading, setIsPrintDataLoading] = useState(false);
    // console.log("isPrintDataLoading", isPrintDataLoading)

    const [adjustPackageModal, setAdjustPackageModal] = useState(false);

    const packageLabelContentRef = React.useRef<HTMLDivElement>(null);
    const exitLabelContentRef = React.useRef<HTMLDivElement>(null);

    const [adjustmentNote, setAdjustmentNote] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [isReport, setIsReport] = useState(false);
    const [newQty, setNewQty] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [totalTerpenes, setTotalTerpenes] = useState('');

    // Query
    const { data: adjustmentReasonsData, isLoading: adjustmentReasonsLoading } = useMetrcAdjustmentReasonsByDispensaryIdQuery({
        dispensaryId: dispensaryId,
    });

    const adjustPackageMutation = useAdjustPackageMutation();

    // Function to calculate the number of days between two dates
    console.log('---------------packageData---------------- ', packageData);

    useEffect(() => {
        let totalTerpenes = '';
        packageData?.TestResult.map((item: any) => {
            if (item.testResultLevel <= 0) return;
            totalTerpenes += item.testTypeName + ' - ' + item.testResultLevel + ', ';
        });

        setTotalTerpenes(totalTerpenes);
    }, [packageData?.TestResult]);

    useEffect(() => {
        setNewQty(packageData?.assignPackage?.posQty || 0);
    }, [packageData?.assignPackage?.posQty]);

    const handleGotoLink = async (page: string, key: string, value: string) => {
        // Create a URLSearchParams object to properly format the query parameters
        const searchParams = new URLSearchParams();
        searchParams.append(key, value);
        // console.log('searchParams', searchParams.toString());
        
        // Construct the full URL dynamically
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ashespos.ai';
        const fullUrl = `${baseUrl}/org/${organizationId}/${storeLinkName}/${page}?${searchParams.toString()}`;
        
        // Check if we're in an Electron environment
        const isElectron = typeof window !== 'undefined' && 
            (window as any).process && 
            (window as any).process.type;
        
        if (isElectron) {
            // In Electron, use the shell module to open external links
            // This will open in the default browser
            if (window.require) {
                const { shell } = window.require('electron');
                shell.openExternal(fullUrl);
            }
        } else {
            // In web browser, open in new tab
            window.open(fullUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handlePackageLabelPrint = useReactToPrint({
        contentRef: packageLabelContentRef,
        // Remove bodyClass as it might interfere with positioning
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            @page {
                size: auto;
                margin: 0mm;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', Arial, sans-serif !important;
                }
                * {
                    box-sizing: border-box;
                }
            }
        `,
    });
    // const handleExitLabelPrint = useReactToPrint({
    //     contentRef: exitLabelContentRef,
    //     // Optional: You can also specify additional options like page style
    //     pageStyle: `
    //         @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
    //         @page {
    //             size: auto;
    //             margin: 0mm;
    //         }
    //         @media print {
    //             body {
    //                 margin: 0;
    //                 padding: 0;
    //                 font-family: 'Roboto', Arial, sans-serif !important;
    //             }
    //             * {
    //                 box-sizing: border-box;
    //             }
    //         }
    //     `,
    // });

    const handleShowModal = () => {
        setAdjustPackageModal(true);
    };

    const handleAjustPackage = async () => {
        if (newQty < 0 || adjustmentNote == '' || adjustmentReason == '') return;
        setAdjustPackageModal(false);
        Swal.fire({
            icon: 'warning',
            title: 'Adjust Package?',
            text: 'Are you going to really adjust?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await adjustPackageMutation.mutate(
                    {
                        input: {
                            dispensaryId: dispensaryId,
                            newQty: newQty,
                            notes: adjustmentNote,
                            packageLabel: packageData?.packageLabel,
                            reason: adjustmentReason,
                            deltaQty: newQty - packageData?.assignPackage?.posQty,
                            needMetrcSync: isReport,
                        },
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            // successAlert('Package Adjustment successful.');
                            Store.addNotification({
                                title: 'Success',
                                message: packageData?.packageId
                                    ? 'Package stock adjustment was successful. Please go to Metrc Reconciliation page then sync with Metrc.'
                                    : `Package stock adjustment was successful.`,
                                type: 'success',
                                insert: 'bottom',
                                container: 'bottom-left',
                                animationIn: ['animate__animated', 'animate__fadeIn'],
                                animationOut: ['animate__animated', 'animate__fadeOut'],
                                dismiss: {
                                    duration: 4000,
                                    onScreen: true,
                                },
                            });
                            onAdjustPackage();
                        },
                    }
                );
            }
        });
    };

    const renderPagination = (currentPage: number, totalItems: number, itemsPerPage: number = 5) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

        // Calculate the range of pages to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Adjust start page if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        return (
            <div className="flex justify-center gap-1 mt-4">
                <button
                    className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                >
                    &laquo;
                </button>
                <button
                    className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer"
                    disabled={currentPage === 1}
                    onClick={() =>
                        setCurrentPage((prev) => {
                            return prev == 1 ? 1 : prev - 1;
                        })
                    }
                >
                    &lsaquo;
                </button>
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                    <button
                        key={page}
                        className={`px-3 py-1 border rounded hover:bg-gray-100  dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer ${
                            page === currentPage ? 'bg-gray-200 dark:bg-[#304772]' : ''
                        }`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                ))}
                <button
                    className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                        setCurrentPage((prev) => {
                            return prev == totalPages ? prev : prev + 1;
                        })
                    }
                >
                    &rsaquo;
                </button>
                <button
                    className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-[#1c2942] dark:border-[#17263c] cursor-pointer"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                >
                    &raquo;
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-[#0f1727] shadow-lg rounded-lg w-full mx-auto my-2 border-[1px] border-gray-200 dark:border-[#1a1e3b]">
            {isLoading ? (
                <div className="flex justify-center items-center py-2 px-3">
                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                </div>
            ) : (
                <div className={`flex justify-between items-center text-base text-center font-semibold rounded-t-lg py-2 px-3 ${returnPackageStatusClass(packageData?.packageStatus)}`}>
                    {packageData?.assignPackage?.product?.name ? (
                        <span className="min-h-4">{packageData?.assignPackage?.product?.name}</span>
                    ) : (
                        <span className="flex justify-start items-center text-base text-center font-semibold rounded-t-lg py-2 px-3 text-warning bg-warning-light dark:bg-warning-dark-light">
                            <TiWarningOutline className="mr-2 text-xl font-bold" />
                            This package is not connected with any product!
                        </span>
                    )}
                    <div className="dropdown !relative">
                        <Dropdown
                            placement={``}
                            btnClassName="ml-2 dropdown-toggle"
                            button={
                                <>
                                    <HiOutlineDotsHorizontal className="text-3xl" />
                                </>
                            }
                        >
                            <ul className="!min-w-[170px] absolute -right-0 text-md">
                                {packageData?.packageStatus == 'ACTIVE' ? (
                                    <li>
                                        <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button" onClick={() => setModalOpen(true)}>
                                            <GrConnect className="mr-1" />
                                            Connect Product
                                        </button>
                                    </li>
                                ) : null}

                                {packageData?.assignPackage?.product?.name ? (
                                    <li>
                                        <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button" onClick={handleShowModal}>
                                            <FaAdjust className="mr-1" />
                                            <p className="text-nowrap">Adjust Package</p>
                                        </button>
                                    </li>
                                ) : null}
                                {packageData?.packageStatus == 'ACTIVE' ? (
                                    <li>
                                        <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button" onClick={() => handleHoldPackage()}>
                                            <PiClockClockwiseFill className="mr-1" />
                                            Hold Package
                                        </button>
                                    </li>
                                ) : null}
                                {packageData?.packageStatus == 'HOLD' ? (
                                    <li>
                                        <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button" onClick={handleActivePackage}>
                                            <TbPackages className="mr-1" />
                                            Active Package
                                        </button>
                                    </li>
                                ) : null}
                                {packageData?.packageStatus == 'FINISHED' ? (
                                    <li>
                                        <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button" onClick={handleActivePackage}>
                                            <TbPackages className="mr-1" />
                                            Reactivate
                                        </button>
                                    </li>
                                ) : null}
                                {packageData?.packageStatus == 'ACTIVE' ? (
                                    <li>
                                        <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button" onClick={handleFinishPakcage}>
                                            <LuPackageCheck className="mr-1" />
                                            Finish
                                        </button>
                                    </li>
                                ) : null}
                                {/* {packageData?.packageStatus != 'ACTIVE' && packageData?.packageStatus != 'HOLD' && packageData?.packageStatus != 'FINISHED' ? (
                                    <li>
                                        <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button">
                                            <PiPackageFill className="mr-1" />
                                            Edit
                                        </button>
                                    </li>
                                ) : null} */}
                                <li>
                                    <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button" onClick={() => handlePackageLabelPrint()}>
                                        <BiPrinter className="mr-1" />
                                        <p className="text-nowrap">Print Package Label</p>
                                    </button>
                                </li>
                                {packageData?.packageId ? (
                                    <li>
                                        <button className="flex justify-start items-center text-sm text-dark dark:text-white-dark" type="button">
                                            {/*    <BiPrinter className="mr-1" />
                                        <p className="text-nowrap">Print Excel Label</p>*/}
                                            <SingleExitLabelPrint
                                                packageLabel={packageData?.packageLabel}
                                                packageId={packageData?.packageId}
                                                text="Print Exit Label"
                                                className="flex justify-start items-center text-sm text-dark dark:text-white-dark"
                                                printButtonRef={exitLabelContentRef}
                                                onAfterPrint={() => {}}
                                            />
                                        </button>
                                    </li>
                                ) : null}
                            </ul>
                        </Dropdown>
                    </div>
                </div>
            )}

            <hr className="text-lg dark:border-[#1a1e3b] mb-2" />
            <div className="p-3">
                {/* <div>
                        <div className="flex flex-col justify-start text-center items-start mb-1">
                            <div className="flex items-center space-x-2">
                                <button className="text-dark font-semibold dark:text-dark text-left">
                                    {packageData?.Quantity}
                                    {packageData?.UnitOfMeasureAbbreviation}
                                    <span className="font-medium text-gray-600"> left</span>
                                </button>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-[#1c2942] rounded-full h-2.5 mb-2">
                            <div className="bg-theme_green h-2.5 rounded-full w-0" style={{ width: `${100}%` }}></div>
                        </div>
                        <div className="flex justify-start items-center">
                            <FaClock className="text-dark text-sm mr-1" />
                            <span className="text-sm text-dark ">{calculateDaysBetweenDates(packageData?.PackagedDate, currentDate)} days old</span>
                        </div>
                        <hr className="text-lg dark:border-[#1a1e3b] my-2" />
                    </div> */}
                {hide ? (
                    <div>
                        <div className="flex flex-col gap-4 mb-4">
                            <div>
                                <div className="flex flex-col justify-start text-center items-start mb-1">
                                    <div className="flex items-center space-x-2">
                                        {/* <span className="text-dark dark:text-white-dark">{packageData?.productId}</span> */}
                                        <button className="text-dark dark:text-white-dark font-semibold text-left">
                                            {packageData?.assignPackage?.posQty}
                                            {packageData?.UnitOfMeasureAbbreviation}
                                            <span className="font-medium text-gray-600"> left</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-[#1c2942] rounded-full h-2.5 mb-2">
                                    <div className="bg-theme_green h-2.5 rounded-full w-0" style={{ width: `${((packageData?.assignPackage?.posQty / packageData?.originalQty) * 100) % 101}%` }}></div>
                                </div>
                                <div className="flex justify-start items-center">
                                    <FaClock className="text-dark dark:text-white-dark text-sm mr-1" />
                                    <span className="text-sm text-dark dark:text-white-dark ">{calculateDaysBetweenDates(packageData?.PackagedDate, currentDate)} days old</span>
                                </div>
                                <hr className="text-lg dark:border-[#1a1e3b] my-2" />
                            </div>
                            <div className="flex justify-start items-center text-xl font-gray-500">
                                <FaBarcode className="mr-1" />
                                {packageData?.packageLabel.slice(-10).toUpperCase()}
                                <CopyButton text={packageData?.packageLabel.slice(-10).toUpperCase()} className="ml-2" />
                            </div>
                            <DetailItem label="Product:" value={packageData?.assignPackage?.product?.name} show={packageData?.itemId == null || packageData?.itemId == undefined} />
                            <LinkItem
                                page="product/product"
                                label="Product"
                                paramKey="productId"
                                value={packageData?.assignPackage?.product?.name}
                                param={packageData?.assignPackage?.product?.id}
                                handleGotoLink={handleGotoLink}
                            />
                            <DetailItem
                                label="Product Category:"
                                value={packageData?.assignPackage?.product?.itemCategory?.name}
                                show={packageData?.itemId == null || packageData?.itemId == undefined}
                            />
                            <DetailItem label="Synced At:" value={convertPSTTimestampToTimezone(packageData?.updatedAt, userData.storeTimeZone)} show={true} />
                            <DetailItem label="Activated At:" value={convertPSTTimestampToTimezone(packageData?.ReceivedDateTime, userData.storeTimeZone)} show={true} />
                            {packageData?.IsFinished ? <DetailItem label="Finished At:" value={packageData?.FinishedDate} show={true} /> : null}
                            <DetailItem label="Supplier:" value={packageData?.ReceivedFromFacilityName} show={true} />
                            <DetailItem label="Supplier License:" value={packageData?.ReceivedFromFacilityLicenseNumber} show={true} />
                            {/* <DetailItem label="Transfer:" value={packageData?.product?.name} show={packageData?.itemId == null || packageData?.itemId == undefined} /> */}
                            <LinkItem
                                page="inventory/transfer"
                                label="Transfer ID"
                                paramKey="transferId"
                                value={packageData?.delivery?.transfer.transferId}
                                param={packageData?.delivery?.transfer.id}
                                handleGotoLink={handleGotoLink}
                            />
                            <DetailItem
                                label="Original Qty:"
                                value={packageData?.originalQty + ' ' + (quantityAbbreviations[packageData?.UnitOfMeasureName] || 'items')}
                                show={packageData?.itemId == null || packageData?.itemId == undefined}
                            />
                            <DetailItem label="Cost per Item:" value={packageData?.assignPackage?.cost} show={packageData?.itemId == null || packageData?.itemId == undefined} isMoney={true} />
                            <DetailItem
                                label="Total Cost:"
                                value={packageData?.originalQty * packageData?.assignPackage?.cost}
                                show={packageData?.itemId == null || packageData?.itemId == undefined}
                                isMoney={true}
                            />
                            <DetailItem label="Metrc Tag:" value={packageData?.packageLabel} show={packageData?.itemId != null && packageData?.itemId != undefined} isCopy={true} />
                            <DetailItem label="Metrc Id:" value={packageData?.packageId} show={packageData?.itemId != null && packageData?.itemId != undefined} />
                            {/* <DetailItem
                                label={`${packageData?.itemQuantityType == 'WeightBased' ? 'Original Weight' : 'Original Qty:'}`}
                                value={`${packageData?.originalQty} ${packageData?.itemQuantityType == 'WeightBased' ? 'Grams' : 'Items'}`}
                            />
                            <DetailItem
                                label={`${packageData?.itemQuantityType == 'WeightBased' ? 'Current Weight' : 'Current Qty:'}`}
                                value={`${packageData?.Quantity} ${packageData?.itemQuantityType == 'WeightBased' ? 'Grams' : 'Items'}`}
                            /> */}
                            <DetailItem
                                label="Cost Per Item:"
                                value={Number(truncateToTwoDecimals(packageData?.assignPackage?.cost))}
                                show={packageData?.itemId != null && packageData?.itemId != undefined}
                                isMoney={true}
                            />
                            <DetailItem
                                label="Total Cost:"
                                value={Number(truncateToTwoDecimals(packageData?.originalQty * packageData?.assignPackage?.cost))}
                                show={packageData?.itemId != null && packageData?.itemId != undefined}
                                isMoney={true}
                            />
                            <DetailItem label="Metrc Name:" value={packageData?.itemName} show={packageData?.itemId != null && packageData?.itemId != undefined} />
                            <DetailItem label="Metrc Qty:" value={packageData?.Quantity} show={packageData?.itemId != null && packageData?.itemId != undefined} />
                            {/* <DetailItem label="Current Qty:" value={packageData?.assignPackage?.posQty} show={packageData?.itemId != null && packageData?.itemId != undefined} /> */}
                            <DetailItem
                                label="Metrc Unit Weight:"
                                value={packageData?.itemUnitWeight ? packageData?.itemUnitWeight + ' ' + packageData?.UnitOfMeasureAbbreviation : ''}
                                show={packageData?.itemId != null && packageData?.itemId != undefined}
                            />
                            <DetailItem label="Metrc Source Category Name:" value={packageData?.itemProductCategoryName} show={packageData?.itemId != null && packageData?.itemId != undefined} />
                            <DetailItem label="Metrc Location:" value={packageData?.LocationName} show={packageData?.itemId != null && packageData?.itemId != undefined} />
                            <hr className="text-lg dark:border-[#1a1e3b] my-1" />
                            <div className="flex justify-end">
                                <button className="btn btn-outline-primary !p-1 text-nowrap" onClick={handleFetchTestResult}>
                                    <GrDocumentTest className="mr-2" /> Fetch Test Result
                                </button>
                            </div>
                            <DetailItem
                                label="Date Tested:"
                                value={packageData?.TestResult && packageData?.TestResult[0]?.testPerformedDate}
                                show={packageData?.itemId != null && packageData?.itemId != undefined}
                            />
                            <DetailItem label="Total Terpenes:" value={totalTerpenes} show={packageData?.itemId != null && packageData?.itemId != undefined} />
                        </div>
                        <hr className="text-lg dark:border-[#1a1e3b] my-2" />
                        {/* <div className="flex flex-col gap-4 mb-4">
                        <DetailItem label="Date Tested:" value={packageData?.dateTested} />
                        <DetailItem label="THC:" value={`${packageData?.thc}%`} />
                        <DetailItem label="THCA:" value={`${packageData?.thca}%`} />
                        <DetailItem label="CBC:" value={`${packageData?.cbc}%`} />
                        <DetailItem label="CBN:" value={`${packageData?.cbn}%`} />
                        <DetailItem label="THCV:" value={`${packageData?.thcv}%`} />
                        <DetailItem label="CBG:" value={`${packageData?.cbg}%`} />
                    </div>

                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Total Terpenes:</h3>
                        <ul className="list-disc pl-5">
                            {packageData?.totalTerpenes
                                ? packageData?.totalTerpenes.map((terpene: any, index: any) => (
                                      <li key={index} className="text-sm">
                                          {terpene}
                                      </li>
                                  ))
                                : null}
                        </ul>
                    </div> 
                        <DetailItem label="Total Potential Psychoactive THC:" value={`${packageData?.totalPotentialPsychoactiveThc}%`} />
                    */}
                    </div>
                ) : null}
                <div className="mt-2">
                    <button className="text-dark dark:text-white-dark hover:text-gray-800 dark:hover:text-gray-400 underline" onClick={() => setHide(!hide)}>
                        {hide ? 'Hide' : 'Show'} Details
                    </button>
                </div>
            </div>
            {/* Order History Section */}
            <div className="panel rounded-lg shadow p-6">
                <div className="flex items-center justify-between gap-2 mb-6 border-b dark:border-[#17263c] pb-2">
                    {/* <MdHistory  className='text-dark dark:text-white-dark'/> */}
                    <h2 className="text-xl font-semibold text-dark dark:text-white-dark">Sales History</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            // Prepare CSV data
                            const headers = ['Date', 'Order', 'Qty', 'Cost', 'Price', 'Metrc'];
                            const rows = packageData?.OrderItem?.map((orderItem: any) => [
                                orderItem.order.orderDate,
                                `#${orderItem.orderId}`,
                                orderItem.quantity,
                                `$${orderItem.cost}`,
                                `$${orderItem.price}`,
                                orderItem?.order?.metrcId ?? '',
                            ]);
                            const csvContent = [headers, ...rows].map((row) => row.map((field: any) => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
                            // Download CSV
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', packageData?.packageLabel.toUpperCase() + '_sales_history.csv');
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        }}
                    >
                        Export CSV
                    </button>
                </div>

                <div className="space-y-4">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Order
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Qty
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Cost / Price
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Metrc
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesHistory?.map((orderItem: any, index: any) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">{new Date(orderItem.order.orderDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 flex flex-col justify-center items-start">
                                        {/* <p>#{orderItem.orderId}</p> */}
                                        <LinkItem page='orders/orders' label='' paramKey='id' param={orderItem.orderId} value={`#${orderItem.orderId}`} handleGotoLink={handleGotoLink}/>
                                        <OrderStatusBadge status={orderItem?.order?.status} className="!p-[2px]" />
                                    </td>
                                    <td className="px-6 py-4">{orderItem.quantity}</td>
                                    <td className="px-6 py-4">
                                        ${orderItem.cost} / ${orderItem.price}
                                    </td>
                                    <td className="px-6 py-4">{orderItem?.order?.metrcId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {renderPagination(currentPage, packageData?.OrderItem?.length)}
                <div className="text-sm text-dark dark:text-white-dark text-center mt-2">
                    Showing results {(currentPage - 1) * 5 + 1 || 0} through {Math.min(currentPage * 5, packageData?.OrderItem?.length) || 0} of {packageData?.OrderItem?.length}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-[#17263c]">
                    <span className="text-gray-600">{packageData?.OrderItem?.length} Total Orders</span>
                    {/* <span className="text-gray-900 font-medium">Total Spent: ${customerData?.Order?.totalSpent.toFixed(2)}</span> */}
                </div>
            </div>
            <div className="hidden">
                <div className="w-[250px] !font-roboto m-0 p-2 absolute top-0 left-0 print:relpackageData?.OrderItemative" style={{ fontSize: '13px' }} ref={packageLabelContentRef}>
                    <span style={{ display: 'block', lineHeight: '1', margin: '0', wordBreak: 'break-word' }}>{packageData?.assignPackage?.product?.name}</span>
                    <span style={{ display: 'block', lineHeight: '1', margin: '0' }}>Price: ${truncateToTwoDecimals(packageData?.assignPackage?.product?.price)}</span>
                    <div className="flex flex-col justify-start items-center m-0">
                        <Barcode value={packageData?.packageLabel?.slice(-10) || ''} height={50} fontSize={18} displayValue={false} margin={0} />
                        <span className="">Pkg ID: {packageData?.packageLabel?.slice(-10)}</span>
                    </div>
                </div>
            </div>
            <Transition appear show={adjustPackageModal} as={Fragment}>
                <Dialog as="div" open={adjustPackageModal} onClose={() => setAdjustPackageModal(true)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                        <div className="flex items-start justify-center min-h-screen px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div" className="panel my-8 w-1/2 absolute m rounded-lg border-0 px-5 py-3 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between px-4 py-2">
                                        <div className="flex items-center text-lg font-bold">
                                            {/* <FaCashRegister className="mr-3 text-dark dark:text-white-dark" /> */}
                                            Add New Adjustment
                                        </div>
                                        <button type="button" className="text-dark hover:text-dark dark:text-white-dark" onClick={() => setAdjustPackageModal(false)}>
                                            <RxCross1 />
                                        </button>
                                    </div>
                                    <div className="max-w-3xl mx-auto p-6 shadow-sm rounded-lg mt-3 border-[0px] dark:border-[#1b2e4b] text-dark dark:text-white-dark">
                                        {/* Product Info  */}
                                        <div className="flex flex-col mb-4">
                                            <div>
                                                <span className="font-medium">Product:</span>
                                                <span className="ml-2">{packageData?.assignPackage?.product?.name} </span>
                                                <div className="flex justify-start items-center">
                                                    <FaBarcode className="mr-1" />
                                                    {packageData?.packageLabel.slice(-10).toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-medium">Current Qty:</span>
                                                <span className="ml-2">5 Items</span>
                                            </div>
                                        </div>

                                        {/* <!-- Divider --> */}
                                        <div className="border-t border-gray-200 dark:border-[#1b2e4b] my-4"></div>

                                        {/* <!-- Table Header --> */}
                                        <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-200 dark:border-[#1b2e4b] text-dark dark:text-white-dark">
                                            {/* <div className="font-medium">Storage Location</div> */}
                                            <div className="font-bold">Expected Quantity</div>
                                            <div className="font-bold">New Quantity</div>
                                        </div>

                                        {/* <!-- Table Row --> */}
                                        <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-200 dark:border-[#1b2e4b] text-dark dark:text-white-dark">
                                            {/* <div className="">(No Location)</div> */}
                                            <div className="">{packageData?.assignPackage?.posQty + ' ' + (quantityAbbreviations[packageData?.UnitOfMeasureName] || 'items')}</div>
                                            <div className={`flex ${submitted && newQty < 0 ? 'has-error' : ''}`}>
                                                <span className="text-red-500 mr-2">*</span>
                                                <input
                                                    type={`${packageData?.UnitOfMeasureName == 'Each' ? 'text' : 'number'}`}
                                                    placeholder="Recipient's username"
                                                    className="form-input no-spinner ltr:rounded-r-none rtl:rounded-l-none"
                                                    value={newQty}
                                                    onChange={(e) => setNewQty(Number(e.target.value))}
                                                />
                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                    {quantityAbbreviations[packageData?.UnitOfMeasureName]}
                                                </div>
                                            </div>
                                        </div>

                                        {/* <!-- Form Fields --> */}
                                        <div className="mt-6 space-y-4">
                                            <div className="flex items-center">
                                                <label className="w-56 text-right pr-4 font-medium">
                                                    Adjustment Reasons <span className="text-red-500">*</span>
                                                </label>
                                                <div className={`flex-1 ${submitted && !adjustmentReason ? 'has-error' : ''}`}>
                                                    {/* <input className='form-input' value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value) }/>
                                                     */}
                                                    <div className="relative">
                                                        <select name="" id="" className="form-input pr-8" value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)}>
                                                            <option value="">Select Adjustment Reason</option>
                                                            {adjustmentReasonsData?.metrcAdjustmentReasonsByDispensaryId?.map((item, index) => (
                                                                <option key={index} value={item?.Name}>
                                                                    {item?.Name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                                                            <FaChevronDown />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center text-dark dark:text-white-dark">
                                                <label className="w-56 text-right pr-4 font-medium">
                                                    Adjustment Notes <span className="text-red-500">*</span>
                                                </label>
                                                <div className={`flex-1 ${submitted && !adjustmentNote ? 'has-error' : ''}`}>
                                                    <input type="text" className="form-input" value={adjustmentNote} onChange={(e) => setAdjustmentNote(e.target.value)} />
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <label className="w-56 text-right pr-4 font-medium">
                                                    Report Adjustment to State
                                                    <br />
                                                    Traceability System
                                                </label>
                                                <div className="flex-1">
                                                    <label className="w-12 h-6 relative">
                                                        <input
                                                            type="checkbox"
                                                            className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                            id="custom_switch_checkbox1"
                                                            checked={isReport}
                                                            onChange={() => setIsReport(!isReport)}
                                                        />
                                                        <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* <!-- Divider --> */}
                                        <div className="border-t border-gray-200 dark:border-[#1b2e4b] my-6"></div>

                                        {/* <!-- Summary --> */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <span className="font-medium">Difference:</span>
                                                <span className="ml-2">
                                                    {truncateToTwoDecimals(newQty - packageData?.assignPackage?.posQty)} {quantityAbbreviations[packageData?.UnitOfMeasureName]}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">New Quantity:</span>
                                                <span className="ml-2">{truncateToTwoDecimals(newQty) + ' ' + quantityAbbreviations[packageData?.UnitOfMeasureName]}</span>
                                            </div>
                                        </div>

                                        {/* <!-- Buttons --> */}
                                        <div className="flex justify-end space-x-3">
                                            <button className="btn btn-outline-secondary" onClick={() => setAdjustPackageModal(false)}>
                                                Cancel
                                            </button>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    setSubmitted(true);
                                                    handleAjustPackage();
                                                }}
                                            >
                                                Save & Close
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            <Transition appear show={modalOpen} as={Fragment}>
                <Dialog as="div" open={modalOpen} onClose={() => setModalOpen(true)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 " />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] bg-[black]/60 overflow-auto">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel my-8 w-10/12 rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex justify-end bg-[#fbfbfb] px-5 py-3 dark:bg-[#060817]">
                                        {/* <div className="text-lg font-bold">{'Set Package'}</div> */}
                                        <div onClick={() => setModalOpen(false)} className="text-white-dark hover:text-dark dark:text-white-dark cursor-pointer">
                                            <IconX />
                                        </div>
                                    </div>
                                    <div className="bg-[#fbfbfb] dark:bg-[#121c2c] rounded-lg">
                                        {/* <SetPackage deliverId={deliverId} transferId={transferDataById?.id} mtrTransferId={transferDataById?.transferId} status={transferDataById?.status} isMj={transferDataById?.isMJ}/> */}
                                        <div>
                                            <h2 className="text-2xl text-center font-semibold text-dark dark:text-white-dark">Connect Package to Product</h2>
                                            <div className="dark:bg-[#060818] px-3">
                                                <SinglePackageTransfer
                                                    packageData={packageData}
                                                    handleRefetchPackage={handleRefetchPackage}
                                                    transferId={packageData?.delivery?.transfer.id}
                                                    mtcTransferId={packageData?.delivery?.transfer?.transferId}
                                                    isMj={packageData?.packageId > 0}
                                                />
                                                {/* {packageData?.isMJ ? null : (
                                                                <div className="w-full flex justify-center py-2">
                                                                    <button className="relative btn btn-outline-primary mx-auto my-2" onClick={() => handleCreateNonMJTransfer()} disabled={isAddPackage}>
                                                                        {' '}
                                                                        {isAddPackage ? <FaSpinner className='animate-spin mr-1' /> : null}
                                                                        + Add Package
                                                                    </button>
                                                                </div>
                                                            )} */}
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

function DetailItem({ label, value, show, isMoney = false, isCopy = false }: { label: string; value: string | number; show: boolean; isMoney?: boolean; isCopy?: boolean }) {
    return show ? (
        <div className="flex justify-start">
            <span className="text-sm !font-varela_Round font-semibold text-dark dark:text-white-dark w-1/2">{label}</span>
            <span className="text-sm text-left w-1/2 flex justify-start items-center">
                {isCopy ? <CopyButton text={value?.toString()} className="pr-1" /> : null}
                {(() => {
                    // Check if value is null, undefined, or NaN
                    if (value === null || value === undefined || value == 'NaN' || (typeof value === 'number' && isNaN(value))) {
                        return '';
                    }

                    // For money values, only add $ if it's a valid number
                    if (isMoney) {
                        return !isNaN(Number(value)) ? '$' + value : value;
                    }

                    // For non-money values, just return the value
                    return value;
                })()}
            </span>
        </div>
    ) : null;
}

function LinkItem({
    page,
    label,
    paramKey,
    param,
    value,
    handleGotoLink,
}: {
    page: string;
    label: string;
    paramKey: string;
    param: string;
    value: string;
    handleGotoLink: (page: string, paramKey: string, value: string) => void;
}) {
    return (
        <div className="flex justify-start">
            {label != '' && <span className="text-sm !font-varela_Round font-semibold text-dark dark:text-white-dark w-1/2">{label}</span>}
            <a className="text-sm text-left text-dark dark:text-white-dark font-bold cursor-pointer underline w-1/2" onClick={() => handleGotoLink(page, paramKey, param)}>
                {value == null ? '' : value}
            </a>
        </div>
    );
}
