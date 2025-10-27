'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { PrintType, useCreatePrintSettingMutation, usePrintSettingByDispensaryIdQuery } from '@/src/__generated__/operations';
import { userDataSave } from '@/store/userData';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Barcode from 'react-barcode';
import Divider from '../etc/divider';
import ImageUpload from '../etc/ImageUpload';

export default function PrintSetting() {
    const packageLabelContentRef = useRef<HTMLDivElement>(null);
    const receiptContentRef = useRef<HTMLDivElement>(null);
    const drawerContentRef = useRef<HTMLDivElement>(null);
    const moneyDropContentRef = useRef<HTMLDivElement>(null); // Add new ref

    // User Data
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;

    // Toggle states
    const [disableExitLabels, setDisableExitLabels] = useState<boolean>(false);
    const [labelInfoEnabled, setLabelInfoEnabled] = useState<boolean>(false);
    const [productNameEnabled, setProductNameEnabled] = useState<boolean>(true);
    const [strainNameEnabled, setStrainNameEnabled] = useState<boolean>(true);
    const [storeNameEnabled, setStoreNameEnabled] = useState<boolean>(false);
    // Dimension states
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    // Margin states
    const [topMargin, setTopMargin] = useState(0.1);
    const [rightMargin, setRightMargin] = useState(0.1);
    const [bottomMargin, setBottomMargin] = useState(0.1);
    const [leftMargin, setLeftMargin] = useState(0.1);

    // Font and text states
    const [fontSize, setFontSize] = useState(14);
    const [topText, setTopText] = useState('');
    const [bottomText, setBottomText] = useState('');

    // Receipt states
    const [disableReceipt, setDisableReceipt] = useState<boolean>(false);
    const [receiptWidth, setReceiptWidth] = useState(0);
    const [receiptHeight, setReceiptHeight] = useState(0);
    const [receiptTopMargin, setReceiptTopMargin] = useState(0.1);
    const [receiptRightMargin, setReceiptRightMargin] = useState(0.1);
    const [receiptBottomMargin, setReceiptBottomMargin] = useState(0.1);
    const [receiptLeftMargin, setReceiptLeftMargin] = useState(0.1);
    const [receiptFontSize, setReceiptFontSize] = useState(14);
    const [receiptTopText, setReceiptTopText] = useState('');
    const [receiptBottomText, setReceiptBottomText] = useState('');
    const [receiptSelectedFont, setReceiptSelectedFont] = useState('Roboto');

    // Receipt Image states
    const [receiptTopImageUrl, setReceiptTopImageUrl] = useState('');
    const [receiptBottomImageUrl, setReceiptBottomImageUrl] = useState('');
    const [showReceiptTopImage, setShowReceiptTopImage] = useState(false);
    const [showReceiptBottomImage, setShowReceiptBottomImage] = useState(false);
    const [receiptTopImageWidth, setReceiptTopImageWidth] = useState(200);
    const [receiptTopImageHeight, setReceiptTopImageHeight] = useState(100);
    const [receiptBottomImageWidth, setReceiptBottomImageWidth] = useState(200);
    const [receiptBottomImageHeight, setReceiptBottomImageHeight] = useState(100);

    // Drawer Print
    const [disableDrawerPrint, setDisableDrawerPrint] = useState<boolean>(false);
    const [drawerWidth, setDrawerWidth] = useState(0);
    const [drawerHeight, setDrawerHeight] = useState(0);
    const [drawerTopMargin, setDrawerTopMargin] = useState(0);
    const [drawerRightMargin, setDrawerRightMargin] = useState(0);
    const [drawerBottomMargin, setDrawerBottomMargin] = useState(0);
    const [drawerLeftMargin, setDrawerLeftMargin] = useState(0);
    const [drawerFontSize, setDrawerFontSize] = useState(14);
    const [drawerTopText, setDrawerTopText] = useState('');
    const [drawerBottomText, setDrawerBottomText] = useState('');
    const [drawerSelectedFont, setDrawerSelectedFont] = useState('Roboto');

    // Money Drop Print states
    const [disableMoneyDropPrint, setDisableMoneyDropPrint] = useState<boolean>(false);
    const [moneyDropWidth, setMoneyDropWidth] = useState(0);
    const [moneyDropHeight, setMoneyDropHeight] = useState(0);
    const [moneyDropTopMargin, setMoneyDropTopMargin] = useState(0);
    const [moneyDropRightMargin, setMoneyDropRightMargin] = useState(0);
    const [moneyDropBottomMargin, setMoneyDropBottomMargin] = useState(0);
    const [moneyDropLeftMargin, setMoneyDropLeftMargin] = useState(0);
    const [moneyDropFontSize, setMoneyDropFontSize] = useState(14);
    const [moneyDropTopText, setMoneyDropTopText] = useState('');
    const [moneyDropBottomText, setMoneyDropBottomText] = useState('');
    const [moneyDropSelectedFont, setMoneyDropSelectedFont] = useState('Roboto');

    // Add font state
    const [selectedFont, setSelectedFont] = useState('Roboto');

    // Add font options
    const fontOptions = [
        { value: 'Roboto', label: 'Roboto' },
        { value: 'Arial', label: 'Arial' },
        { value: 'Times New Roman', label: 'Times New Roman' },
        { value: 'Helvetica', label: 'Helvetica' },
    ];

    // Query
    const printSettingRowData = usePrintSettingByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const printSettingData = printSettingRowData.data?.printSettingByDispensaryId;

    const exitLabelPrintSettingData = useMemo(() => printSettingData?.find((item) => item?.printType === 'exitLabel') || null, [printSettingData]);
    const receiptPrintSettingData = useMemo(() => printSettingData?.find((item) => item?.printType === 'receipt') || null, [printSettingData]);
    const drawerPrintSettingData = useMemo(() => printSettingData?.find((item) => item?.printType === 'drawer') || null, [printSettingData]);
    const moneyDropPrintSettingData = useMemo(() => printSettingData?.find((item) => item?.printType === 'moneyDrop') || null, [printSettingData]);

    console.log('exitLabelPrintSettingData', exitLabelPrintSettingData);
    // console.log("deliveryReceiptPrintSettingData", deliveryReceiptPrintSettingData)
    // Mutation
    const createPrintSettingMutation = useCreatePrintSettingMutation();

    useEffect(() => {
        console.log('useEffect --> exitLabelPrintSettingData', exitLabelPrintSettingData);
        if (exitLabelPrintSettingData) {
            // Set toggle states
            setDisableExitLabels(exitLabelPrintSettingData?.isEnabled || true);

            // Set dimension states
            setWidth(exitLabelPrintSettingData?.dimensionWidth || 0);
            setHeight(exitLabelPrintSettingData?.dimensionHeight || 0);

            // Set margin states
            setTopMargin(exitLabelPrintSettingData?.marginTop || 0);
            setRightMargin(exitLabelPrintSettingData?.marginRight || 0);
            setBottomMargin(exitLabelPrintSettingData?.marginBottom || 0);
            setLeftMargin(exitLabelPrintSettingData?.marginLeft || 0);

            // Set font and text states
            setFontSize(exitLabelPrintSettingData?.fontSize || 0);
            setTopText(exitLabelPrintSettingData?.topText || '');
            setBottomText(exitLabelPrintSettingData?.bottomText || '');
        }
    }, [exitLabelPrintSettingData]);

    // Add new useEffect for Receipt settings
    useEffect(() => {
        if (receiptPrintSettingData) {
            
            // Set toggle states
            setDisableReceipt(receiptPrintSettingData?.isEnabled || false);

            // Set dimension states
            setReceiptWidth(receiptPrintSettingData?.dimensionWidth || 0);
            setReceiptHeight(receiptPrintSettingData?.dimensionHeight || 0);

            // Set margin states
            setReceiptTopMargin(receiptPrintSettingData?.marginTop || 0);
            setReceiptRightMargin(receiptPrintSettingData?.marginRight || 0);
            setReceiptBottomMargin(receiptPrintSettingData?.marginBottom || 0);
            setReceiptLeftMargin(receiptPrintSettingData?.marginLeft || 0);

            // Set font and text states
            setReceiptFontSize(receiptPrintSettingData?.fontSize || 0);
            setReceiptTopText(receiptPrintSettingData?.topText || '');
            setReceiptBottomText(receiptPrintSettingData?.bottomText || '');

            // Set image states (these would need to be added to the backend schema)
            // setReceiptTopImageUrl(receiptPrintSettingData?.topImageUrl || '');
            // setReceiptBottomImageUrl(receiptPrintSettingData?.bottomImageUrl || '');
            // setShowReceiptTopImage(receiptPrintSettingData?.showTopImage || false);
            // setShowReceiptBottomImage(receiptPrintSettingData?.showBottomImage || false);
            // setReceiptTopImageWidth(receiptPrintSettingData?.topImageWidth || 200);
            // setReceiptTopImageHeight(receiptPrintSettingData?.topImageHeight || 100);
            // setReceiptBottomImageWidth(receiptPrintSettingData?.bottomImageWidth || 200);
            // setReceiptBottomImageHeight(receiptPrintSettingData?.bottomImageHeight || 100);
        }
    }, [receiptPrintSettingData]);

    useEffect(() => {
        console.log('useEffect --> drawerPrintSettingData', drawerPrintSettingData);
        if (drawerPrintSettingData) {
            // Set toggle states
            setDisableDrawerPrint(drawerPrintSettingData?.isEnabled || true);

            // Set dimension states
            setDrawerWidth(drawerPrintSettingData?.dimensionWidth || 0);
            setDrawerHeight(drawerPrintSettingData?.dimensionHeight || 0);

            // Set margin states
            setDrawerTopMargin(drawerPrintSettingData?.marginTop || 0); 
            setDrawerRightMargin(drawerPrintSettingData?.marginRight || 0);
            setDrawerBottomMargin(drawerPrintSettingData?.marginBottom || 0);
            setDrawerLeftMargin(drawerPrintSettingData?.marginLeft || 0);

            // Set font and text states
            setDrawerFontSize(drawerPrintSettingData?.fontSize || 0);
            setDrawerTopText(drawerPrintSettingData?.topText || '');
            setDrawerBottomText(drawerPrintSettingData?.bottomText || '');
        }
    }, [drawerPrintSettingData]);

    // Add new useEffect for Money Drop settings
    useEffect(() => {
        console.log('useEffect --> moneyDropPrintSettingData', moneyDropPrintSettingData);
        if (moneyDropPrintSettingData) {
            // Set toggle states
            setDisableMoneyDropPrint(moneyDropPrintSettingData?.isEnabled || true);

            // Set dimension states
            setMoneyDropWidth(moneyDropPrintSettingData?.dimensionWidth || 0);
            setMoneyDropHeight(moneyDropPrintSettingData?.dimensionHeight || 0);

            // Set margin states
            setMoneyDropTopMargin(moneyDropPrintSettingData?.marginTop || 0); 
            setMoneyDropRightMargin(moneyDropPrintSettingData?.marginRight || 0);
            setMoneyDropBottomMargin(moneyDropPrintSettingData?.marginBottom || 0);
            setMoneyDropLeftMargin(moneyDropPrintSettingData?.marginLeft || 0);

            // Set font and text states
            setMoneyDropFontSize(moneyDropPrintSettingData?.fontSize || 0);
            setMoneyDropTopText(moneyDropPrintSettingData?.topText || '');
            setMoneyDropBottomText(moneyDropPrintSettingData?.bottomText || '');
        }
    }, [moneyDropPrintSettingData]);

    const handleSaveExitLabelPrintSetting = async () => {
        await createPrintSettingMutation.mutate(
            {
                input: {
                    bottomText: bottomText,
                    dimensionHeight: height,
                    dimensionWidth: width,
                    dispensaryId: dispensaryId,
                    fontSize: fontSize,
                    isEnabled: disableExitLabels,
                    marginBottom: bottomMargin,
                    marginLeft: leftMargin,
                    marginRight: rightMargin,
                    marginTop: topMargin,
                    printType: 'exitLabel',
                    topText: topText,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    {
                        successAlert('Print Setting Saved Successfully');
                        printSettingRowData.refetch();
                    }
                },
                onSettled() {
                    // setIsNewOrderItemButtonDisabled(false);
                },
            }
        );
    };

    const handleSaveReceiptPrintSetting = async () => {
        await createPrintSettingMutation.mutate(
            {
                input: {
                    bottomText: receiptBottomText,
                    dimensionHeight: receiptHeight,
                    dimensionWidth: receiptWidth,
                    dispensaryId: dispensaryId,
                    fontSize: receiptFontSize,
                    isEnabled: disableReceipt,
                    marginBottom: receiptBottomMargin,
                    marginLeft: receiptLeftMargin,
                    marginRight: receiptRightMargin,
                    marginTop: receiptTopMargin,
                    printType: 'receipt',
                    topText: receiptTopText,
                    // Image fields would need to be added to the backend schema
                    // topImageUrl: receiptTopImageUrl,
                    // bottomImageUrl: receiptBottomImageUrl,
                    // showTopImage: showReceiptTopImage,
                    // showBottomImage: showReceiptBottomImage,
                    // topImageWidth: receiptTopImageWidth,
                    // topImageHeight: receiptTopImageHeight,
                    // bottomImageWidth: receiptBottomImageWidth,
                    // bottomImageHeight: receiptBottomImageHeight,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);   
                },
                onSuccess(data) {
                    if (!data) return;
                    {
                        successAlert('Print Setting Saved Successfully');
                        printSettingRowData.refetch();
                    }
                },
                onSettled() {
                    // setIsNewOrderItemButtonDisabled(false);
                },
            }
        );
    };

    const handleSaveDrawerPrintSetting = async () => {
        await createPrintSettingMutation.mutate(
            {
                input: {
                    bottomText: drawerBottomText,
                    dimensionHeight: drawerHeight,
                    dimensionWidth: drawerWidth,
                    dispensaryId: dispensaryId,
                    fontSize: drawerFontSize,
                    isEnabled: disableDrawerPrint,
                    marginBottom: drawerBottomMargin,
                    marginLeft: drawerLeftMargin,
                    marginRight: drawerRightMargin,
                    marginTop: drawerTopMargin,
                    printType: 'drawer',
                    topText: drawerTopText, 
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    {
                        successAlert('Print Setting Saved Successfully');
                        printSettingRowData.refetch();
                    }
                },
                onSettled() {
                    // setIsNewOrderItemButtonDisabled(false);
                },
            }
        );
    };

    // Add new save handler for Money Drop
    const handleSaveMoneyDropPrintSetting = async () => {
        await createPrintSettingMutation.mutate(
            {
                input: {
                    bottomText: moneyDropBottomText,
                    dimensionHeight: moneyDropHeight,
                    dimensionWidth: moneyDropWidth,
                    dispensaryId: dispensaryId,
                    fontSize: moneyDropFontSize,
                    isEnabled: disableMoneyDropPrint,
                    marginBottom: moneyDropBottomMargin,
                    marginLeft: moneyDropLeftMargin,
                    marginRight: moneyDropRightMargin,
                    marginTop: moneyDropTopMargin,
                    printType: 'moneyDrop',
                    topText: moneyDropTopText,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    {
                        successAlert('Print Setting Saved Successfully');
                        printSettingRowData.refetch();
                    }
                },
                onSettled() {
                    // setIsNewOrderItemButtonDisabled(false);
                },
            }
        );
    };

    const handlePackageExitLabelPrint = useReactToPrint({
        contentRef: packageLabelContentRef,
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            @page {
                size: ${width ? width + 'in' : 'auto'} ${height ? height + 'in' : 'auto'};
                margin: ${topMargin}in ${rightMargin}in ${bottomMargin}in ${leftMargin}in;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', Arial, sans-serif;
                }
                * {
                    box-sizing: border-box;
                    font-size: ${fontSize}pt;
                }
            }
        `,
    });

    const handlePackageReceiptPrint = useReactToPrint({
        contentRef: receiptContentRef,
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            @page {
                size: ${receiptWidth ? receiptWidth + 'in' : 'auto'} ${receiptHeight ? receiptHeight + 'in' : 'auto'};
                margin: ${receiptTopMargin}in ${receiptRightMargin}in ${receiptBottomMargin}in ${receiptLeftMargin}in;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', Arial, sans-serif;
                }
                * {
                    box-sizing: border-box;
                    font-size: ${receiptFontSize}pt;
                }
            }
        `,
    });

    const handlePackageDrawerPrint = useReactToPrint({
        contentRef: drawerContentRef,
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            @page {
                size: ${drawerWidth ? drawerWidth + 'in' : 'auto'} ${drawerHeight ? drawerHeight + 'in' : 'auto'};
                margin: ${drawerTopMargin}in ${drawerRightMargin}in ${drawerBottomMargin}in ${drawerLeftMargin}in;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', Arial, sans-serif;
                }
                * {
                    box-sizing: border-box;
                    font-size: ${drawerFontSize}pt;
                }
            }
        `,
    });

    const handleMoneyDropPrint = useReactToPrint({
        contentRef: moneyDropContentRef,
        pageStyle: `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            @page {
                size: ${moneyDropWidth ? moneyDropWidth + 'in' : 'auto'} ${moneyDropHeight ? moneyDropHeight + 'in' : 'auto'};
                margin: ${moneyDropTopMargin}in ${moneyDropRightMargin}in ${moneyDropBottomMargin}in ${moneyDropLeftMargin}in;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Roboto', Arial, sans-serif;
                }
                * {
                    box-sizing: border-box;
                    font-size: ${drawerFontSize}pt;
                }
            }
        `,
    });
      
    

    return (
        <PerfectScrollbar>
            <div className="w-full h-[80wh] overflow-y-auto">
                    <div className="flex flex-col md:flex-row gap-8 p-4 mx-auto">
                        <div className="flex-1">
                            <h2 className="text-gray-400 text-lg font-medium mb-4">EXIT LABEL</h2>

                            <div className="w-full flex justify-between items-center">
                                <label htmlFor="isSetDuration" className="text-left dark:text-white-dark text-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2 text-nowrap">
                                    Disable Exit Labels
                                </label>
                                <label className="relative h-6 w-12 mt-2">
                                    <input
                                        type="checkbox"
                                        className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                        id="isSetDuration"
                                        defaultChecked={disableExitLabels}
                                        onChange={() => {
                                            setDisableExitLabels(!disableExitLabels);
                                        }}
                                    />
                                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                </label>
                            </div>

                            {/* Dimensions */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Dimensions (Inches)</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">W</span>
                                        <input type="number" step="0.01" min="0" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">H</span>
                                        <input type="number" step="0.01" min="0" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                </div>
                            </div>

                            {/* Margins */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Margins (Inches)</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">T</span>
                                        <input type="number" step="0.01" min="0" value={topMargin} onChange={(e) => setTopMargin(Number(e.target.value))} className="w-full form-input no-spinner" />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">R</span>
                                        <input type="number" step="0.01" min="0" value={rightMargin} onChange={(e) => setRightMargin(Number(e.target.value))} className="w-full form-input no-spinner" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">B</span>
                                        <input type="number" step="0.01" min="0" value={bottomMargin} onChange={(e) => setBottomMargin(Number(e.target.value))} className="w-full form-input no-spinner" />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">L</span>
                                        <input type="number" step="0.01" min="0" value={leftMargin} onChange={(e) => setLeftMargin(Number(e.target.value))} className="w-full form-input no-spinner" />
                                    </div>
                                </div>
                            </div>

                            {/* Font Size */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Font Size</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="number" step="0.01" min="0" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full rounded-l-md rounded-r-none form-input no-spinner" />
                                    <span className="bg-gray-200 dark:bg-dark rounded-r-md rounded-l-none dark:text-white text-dark px-4 py-[9px]">pt</span>
                                </div>
                            </div>

                            {/* Font Family */}
                            {/* <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Font Family</label>
                                </div>
                                <select 
                                    value={selectedFont} 
                                    onChange={(e) => setSelectedFont(e.target.value)}
                                    className="w-full form-select"
                                >
                                    {fontOptions.map((font) => (
                                        <option key={font.value} value={font.value}>
                                            {font.label}
                                        </option>
                                    ))}
                                </select>
                            </div> */}

                            {/* Top Text */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Top Text</label>
                                </div>
                                <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="Example: This product contains THC." className="w-full form-input" />
                            </div>

                            {/* Bottom Text */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Bottom Text</label>
                                </div>
                                <textarea value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="Example: Exchange or Refund within 24 hours. Some restrictions may apply." className="w-full form-input h-32" />
                            </div>
                            <div className="flex justify-end items-center mx-3">
                                <button className="btn btn-primary px-16 mb-2" onClick={() => handleSaveExitLabelPrintSetting()}>
                                    Save
                                </button>
                            </div>

                            {/* Label Info Toggle */}
                            {/* <div className="w-full flex justify-between items-center">
                                <label htmlFor="isSetDuration" className="lg:text-right dark:text-white-dark text-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                    Label Info
                                </label>
                                <label className="relative h-6 w-12 mt-2">
                                    <input
                                        type="checkbox"
                                        className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                        id="isSetDuration"
                                        defaultChecked={true}
                                        onChange={() => {
                                            setLabelInfoEnabled(!labelInfoEnabled);
                                        }}
                                    />
                                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                </label>
                            </div> */}
                        </div>

                        {/* Preview Section */}
                        <div className="flex-1">
                            <div className="flex justify-end mb-4">
                                <button className="btn btn-outline-primary" onClick={() => handlePackageExitLabelPrint()}>
                                    Print Sample Exit Label
                                </button>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="flex justify-end mb-4 gap-4">
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                    </button>
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                            <rect x="6" y="14" width="12" height="8"></rect>
                                        </svg>
                                    </button>
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="1"></circle>
                                            <circle cx="19" cy="12" r="1"></circle>
                                            <circle cx="5" cy="12" r="1"></circle>
                                        </svg>
                                    </button>
                                </div>

                                <div
                                    className="bg-white dark:bg-black p-4 rounded overflow-hidden"
                                    style={{
                                        width: width ? `${width}in` : '200px',
                                        height: height ? `${height}in` : '100%',
                                        fontSize: `${fontSize}pt`,
                                        margin: `${topMargin}in ${rightMargin}in ${bottomMargin}in ${leftMargin}in`,
                                        fontFamily: 'Open Sans, Roboto, Arial, sans-serif'
                                    }}
                                    ref={packageLabelContentRef}
                                >
                                    <p className="font-bold">This is test Product Name 300mg</p>
                                    <p>Strain: Blue Dream</p>
                                    <p>Net Weight: 0.125 Ounce</p>
                                    <p>Batch: 12345</p>
                                    <p>Tested Date: 01/01/2023</p>
                                    <p>Supplier License: 12345678</p>
                                    <p>Test Facility: Active Testing</p>
                                    <p>Date: 01/01/2023</p>
                                    <p>THC: 20.0%, THCA: 2.0%, CBD: 1.0%, CBDA: 1.0%, CBN: 0.5%, Total Principal Psychoactive THC%: 20.0%</p>
                                    <p>For medical use only. Keep out of reach of children. Women</p>
                                    <br />
                                    <p>should not use marijuana or marijuana products during pregnancy due to risk of birth defects. This product has been tested for contaminants.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Receipt */}
                    <hr className="text-lg dark:border-[#1a1e3b] my-1" />
                    <div className="flex flex-col md:flex-row gap-8 p-4 mx-auto">
                        <div className="flex-1">
                            <h2 className="text-gray-400 text-lg font-medium mb-4">RECEIPT</h2>

                            <div className="w-full flex justify-between items-center">
                                <label htmlFor="isSetDuration" className="text-left dark:text-white-dark text-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2 text-nowrap">
                                    Disable Receipt
                                </label>
                                <label className="relative h-6 w-12 mt-2">
                                    <input
                                        type="checkbox"
                                        className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                        id="isSetDuration"
                                        defaultChecked={disableReceipt}
                                        onChange={() => {
                                            setDisableReceipt(!disableReceipt);
                                        }}
                                    />
                                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                </label>
                            </div>

                            {/* Dimensions */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Dimensions (Inches)</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">W</span>
                                        <input type="number" step="0.01" min="0" value={receiptWidth} onChange={(e) => setReceiptWidth(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">H</span>
                                        <input type="number" step="0.01" min="0" value={receiptHeight} onChange={(e) => setReceiptHeight(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                </div>
                            </div>

                            {/* Margins */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Margins (Inches)</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">T</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={receiptTopMargin}
                                            onChange={(e) => setReceiptTopMargin(parseFloat(e.target.value) || 0)}
                                            className="w-full form-input no-spinner"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">R</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={receiptRightMargin}
                                            onChange={(e) => setReceiptRightMargin(Number(e.target.value))}
                                            className="w-full form-input no-spinner"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">B</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={receiptBottomMargin}
                                            onChange={(e) => setReceiptBottomMargin(Number(e.target.value))}
                                            className="w-full form-input no-spinner"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">L</span>
                                        <input type="number" step="0.01" min="0" value={receiptLeftMargin} onChange={(e) => setReceiptLeftMargin(Number(e.target.value))} className="w-full form-input no-spinner" />
                                    </div>
                                </div>
                            </div>

                            {/* Font Size */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Font Size</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="number" step="0.01" min="0" value={receiptFontSize} onChange={(e) => setReceiptFontSize(Number(e.target.value))} className="w-full rounded-l-md rounded-r-none form-input no-spinner" />
                                    <span className="bg-gray-200 dark:bg-dark rounded-r-md rounded-l-none dark:text-white text-dark px-4 py-[9px]">pt</span>
                                </div>
                            </div>

                            {/* Font Family */}
                            {/* <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Font Family</label>
                                </div>
                                <select 
                                    value={receiptSelectedFont} 
                                    onChange={(e) => setReceiptSelectedFont(e.target.value)}
                                    className="w-full form-select"
                                >
                                    {fontOptions.map((font) => (
                                        <option key={font.value} value={font.value}>
                                            {font.label}
                                        </option>
                                    ))}
                                </select>
                            </div> */}

                            {/* Top Text */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Top Text</label>
                                </div>
                                <input type="text" value={receiptTopText} onChange={(e) => setReceiptTopText(e.target.value)} placeholder="Example: form-input" className="w-full form-input" />
                            </div>

                            {/* Bottom Text */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Bottom Text</label>
                                </div>
                                <textarea value={receiptBottomText} onChange={(e) => setReceiptBottomText(e.target.value)} placeholder="Example: Exchange or Refund within 24 hours. Some restrictions may apply." className="w-full form-input h-32" />
                            </div>

                            {/* Top Image Upload */}
                            <ImageUpload
                                label="Top Image"
                                currentImageUrl={receiptTopImageUrl}
                                onImageUploaded={setReceiptTopImageUrl}
                                onImageRemoved={() => setReceiptTopImageUrl('')}
                                showImage={showReceiptTopImage}
                                onShowImageToggle={setShowReceiptTopImage}
                                imageWidth={receiptTopImageWidth}
                                imageHeight={receiptTopImageHeight}
                                onImageWidthChange={setReceiptTopImageWidth}
                                onImageHeightChange={setReceiptTopImageHeight}
                            />

                            {/* Bottom Image Upload */}
                            <ImageUpload
                                label="Bottom Image"
                                currentImageUrl={receiptBottomImageUrl}
                                onImageUploaded={setReceiptBottomImageUrl}
                                onImageRemoved={() => setReceiptBottomImageUrl('')}
                                showImage={showReceiptBottomImage}
                                onShowImageToggle={setShowReceiptBottomImage}
                                imageWidth={receiptBottomImageWidth}
                                imageHeight={receiptBottomImageHeight}
                                onImageWidthChange={setReceiptBottomImageWidth}
                                onImageHeightChange={setReceiptBottomImageHeight}
                            />
                            <div className="flex justify-end items-center mx-3">
                                <button className="btn btn-primary px-16 mb-2" onClick={() => handleSaveReceiptPrintSetting()}>
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="flex-1">
                            <div className="flex justify-end mb-4">
                                <button className="btn btn-outline-primary" onClick={() => handlePackageReceiptPrint()}>
                                    Print Sample Receipt
                                </button>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="flex justify-end mb-4 gap-4">
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                    </button>
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                            <rect x="6" y="14" width="12" height="8"></rect>
                                        </svg>
                                    </button>
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="1"></circle>
                                            <circle cx="19" cy="12" r="1"></circle>
                                            <circle cx="5" cy="12" r="1"></circle>
                                        </svg>
                                    </button>
                                </div>

                                <div
                                    className="bg-white dark:bg-black p-4 rounded overflow-hidden"
                                    style={{
                                        width: receiptWidth ? `${receiptWidth}in` : '200px',
                                        height: receiptHeight ? `${receiptHeight}in` : '100%',
                                        margin: `${receiptTopMargin}in ${receiptRightMargin}in ${receiptBottomMargin}in ${receiptLeftMargin}in`,
                                        fontSize: `${receiptFontSize}pt`,
                                        fontFamily: 'Roboto',
                                    }}
                                    ref={receiptContentRef}
                                >
                                    {/* Top Image */}
                                    {showReceiptTopImage && receiptTopImageUrl && (
                                        <div className="flex justify-center mb-2">
                                            <img
                                                src={receiptTopImageUrl}
                                                alt="Top Image"
                                                style={{
                                                    width: `${receiptTopImageWidth}px`,
                                                    height: `${receiptTopImageHeight}px`,
                                                    objectFit: 'contain',
                                                }}
                                                className="max-w-full"
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col justify-between items-center mb-1">
                                        <h2 className="text-lg font-bold text-nowrap">Highway Cannabis</h2>
                                        <p className="text-xs">4800 Y Ave S, Blackwell Eslackwell, OK, 74631</p>
                                        <p className="text-xs mb-4">580-576-1666</p>
                                    </div>
                                    <div className="border-t text-xs border-gray-200 dark:border-dark pt-4 mb-4" style={{fontSize: `${receiptFontSize}pt`}}>
                                        <p className="">Store # DAAA-4HHZ-E3FH</p>
                                        <p className="">Order # 12345678</p>
                                        <p className="">Customer - Bjorn Bjornson</p>
                                        <p className="">Customer Type - Medical</p>
                                        <p className="">Patient # - ABC12345</p>
                                        <p className="">Loyalty Points Earned - 3</p>
                                        <p className="">Current Loyalty Points - 120</p>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-dark pt-4 mb-4">
                                        <div className="flex justify-between items-center mb-2 text-xs" style={{fontSize: `${receiptFontSize}pt`}}>
                                            <p>1 Strawberry Cough Bulk</p>
                                            <p>$10.00</p>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-xs" style={{fontSize: `${receiptFontSize}pt`}}>
                                            <p>1 OG Kush Bulk</p>
                                            <p>$8.00</p>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-xs" style={{fontSize: `${receiptFontSize}pt`}}>
                                            <p>SUBTOTAL:</p>
                                            <p>$21.00</p>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-xs" style={{fontSize: `${receiptFontSize}pt`}}>
                                            <p>DISCOUNT:</p>
                                            <p>-$3.00</p>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-xs" style={{fontSize: `${receiptFontSize}pt`}}  >
                                            <p>TAX (included):</p>
                                            <p>$0.00</p>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-xs" style={{fontSize: `${receiptFontSize}pt`}}>
                                            <p>TOTAL:</p>
                                            <p>$18.00</p>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-xs" style={{fontSize: `${receiptFontSize}pt`}}>
                                            <p>CASH:</p>
                                            <p>$40.00</p>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-xs" style={{fontSize: `${receiptFontSize}pt`}}>
                                            <p>CHANGE:</p>
                                            <p>$22.00</p>
                                        </div>
                                        <div className='flex justify-center'>
                                            <Barcode value={"12345678"} width={1} height={30} fontSize={12} background='transparent'/>
                                        </div>
                                    </div>

                                    {/* Bottom Image */}
                                    {showReceiptBottomImage && receiptBottomImageUrl && (
                                        <div className="flex justify-center mt-2">
                                            <img
                                                src={receiptBottomImageUrl}
                                                alt="Bottom Image"
                                                style={{
                                                    width: `${receiptBottomImageWidth}px`,
                                                    height: `${receiptBottomImageHeight}px`,
                                                    objectFit: 'contain',
                                                }}
                                                className="max-w-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <hr className="text-lg dark:border-[#1a1e3b] my-1" />

                    {/* Drawer Print Setting */}
                    <div className="flex flex-col md:flex-row gap-8 p-4 mx-auto">
                        <div className="flex-1">
                            <h2 className="text-gray-400 text-lg font-medium mb-4">DRAWER</h2>

                            <div className="w-full flex justify-between items-center">
                                <label htmlFor="isSetDuration" className="text-left dark:text-white-dark text-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2 text-nowrap">
                                    Disable Drawer
                                </label>
                                <label className="relative h-6 w-12 mt-2">
                                    <input
                                        type="checkbox"
                                        className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                        id="isSetDuration"
                                        defaultChecked={disableDrawerPrint}
                                        onChange={() => {
                                            setDisableDrawerPrint(!disableDrawerPrint);
                                        }}
                                    />
                                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                </label>
                            </div>

                            {/* Dimensions */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Dimensions (Inches)</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">W</span>
                                        <input type="number" step="0.01" min="0" value={drawerWidth} onChange={(e) => setDrawerWidth(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">H</span>
                                        <input type="number" step="0.01" min="0" value={drawerHeight} onChange={(e) => setDrawerHeight(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                </div>
                            </div>

                            {/* Margins */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Margins (Inches)</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">T</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={drawerTopMargin}
                                            onChange={(e) => setDrawerTopMargin(parseFloat(e.target.value) || 0)}
                                            className="w-full form-input no-spinner"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">R</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={drawerRightMargin}
                                            onChange={(e) => setDrawerRightMargin(parseFloat(e.target.value) || 0)}
                                            className="w-full form-input no-spinner"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">B</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={drawerBottomMargin}
                                            onChange={(e) => setDrawerBottomMargin(parseFloat(e.target.value) || 0)}
                                            className="w-full form-input no-spinner"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">L</span>
                                        <input type="number" step="0.01" min="0" value={drawerLeftMargin} onChange={(e) => setDrawerLeftMargin(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                </div>
                            </div>

                            {/* Font Size */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Font Size</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="number" step="0.01" min="8" value={drawerFontSize} onChange={(e) => setDrawerFontSize(parseFloat(e.target.value) || 0)} className="w-full rounded-l-md rounded-r-none form-input no-spinner" />
                                    <span className="bg-gray-200 dark:bg-dark rounded-r-md rounded-l-none dark:text-white text-dark px-4 py-[9px]">pt</span>
                                </div>
                            </div>

                            {/* Font Family */}
                            {/* <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Font Family</label>
                                </div>
                                <select 
                                    value={drawerSelectedFont} 
                                    onChange={(e) => setDrawerSelectedFont(e.target.value)}
                                    className="w-full form-select"
                                >
                                    {fontOptions.map((font) => (
                                        <option key={font.value} value={font.value}>
                                            {font.label}
                                        </option>
                                    ))}
                                </select>
                            </div> */}

                            {/* Top Text */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Top Text</label>
                                </div>
                                <input type="text" value={drawerTopText} onChange={(e) => setDrawerTopText(e.target.value)} placeholder="Example: form-input" className="w-full form-input" />
                            </div>

                            {/* Bottom Text */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Bottom Text</label>
                                </div>
                                <textarea value={drawerBottomText} onChange={(e) => setDrawerBottomText(e.target.value)} placeholder="Example: Exchange or Refund within 24 hours. Some restrictions may apply." className="w-full form-input h-32" />
                            </div>
                            <div className="flex justify-end items-center mx-3">
                                <button className="btn btn-primary px-16 mb-2" onClick={() => handleSaveDrawerPrintSetting()}>
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="flex-1">
                            <div className="flex justify-end mb-4">
                                <button className="btn btn-outline-primary" onClick={() => handlePackageDrawerPrint()}>
                                    Print Sample Drawer
                                </button>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="flex justify-end mb-4 gap-4">
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                    </button>
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                            <rect x="6" y="14" width="12" height="8"></rect>
                                        </svg>
                                    </button>
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="1"></circle>
                                            <circle cx="19" cy="12" r="1"></circle>
                                            <circle cx="5" cy="12" r="1"></circle>
                                        </svg>
                                    </button>
                                </div>

                                <div
                                    className="bg-white dark:bg-black p-4 rounded overflow-hidden" 
                                    style={{
                                        width: drawerWidth ? `${drawerWidth}in` : '200px',
                                        height: drawerHeight ? `${drawerHeight}in` : '100%',
                                        margin: `${drawerTopMargin}in ${drawerRightMargin}in ${drawerBottomMargin}in ${drawerLeftMargin}in`,
                                        fontSize: `${drawerFontSize}pt`,
                                        fontFamily: 'Open Sans, Roboto, Arial, sans-serif'
                                    }}
                                    ref={drawerContentRef}
                                >
                                    <h1 className='text-lg font-semibold text-black dark:text-white-dark'>Shift Details</h1>
                                    <div className="flex flex-col justify-between items-start mb-3 w-full">
                                        <div className='flex justify-start items-center leading-none' style={{fontSize: `${drawerFontSize}pt`}}><p>Store:</p><p className='ml-2'>{'Highway Cannabis'}</p></div>
                                        <div className='flex justify-start items-center leading-none' style={{fontSize: `${drawerFontSize}pt`}}><p>Shift Started:</p><p className='ml-2'>05/16/2025 - 10:23 PM</p></div>
                                        <div className='flex justify-start items-center leading-none' style={{fontSize: `${drawerFontSize}pt`}}><p>Time Printed:</p><p className='ml-2'>05/19/2025 - 05:32 PM</p></div>
                                    </div>
                                    <Divider className='my-3' />
                                    <div className="flex flex-col justify-between items-start text-[10px] mb-3 w-full">
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Register Name:</p><p>Register 1</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Started By:</p><p>Budin</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Started At:</p><p>05/16/2025 - 10:05 AM</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Ended By:</p><p>Budin</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Ended At:</p><p>05/19/2025 - 03:57 AM</p></div>
                                    </div>
                                    <Divider className='my-3'/>
                                    <div className="flex flex-col justify-between items-start text-[10px] mb-3 w-full">
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}>
                                            <p>Starting Balance:</p>
                                            <p>$1000</p>
                                        </div>
                                            <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}>
                                            <p>Starting Discrepancy:</p>
                                            <p>$10</p>
                                        </div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}>
                                            <p>Discrepancy Reason:</p>
                                            <p>{'_'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-start text-[10px] mb-3 w-full">
                                        <div className='flex justify-between items-center text-[10px] w-full mt-5' style={{fontSize: `${drawerFontSize}pt`}}><p>Returns:</p><p>$10</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Voids:</p><p>$10</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Incoming Drops:</p><p>$10</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Outgoing Drops:</p><p>$20</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Closing Drop:</p><p>$30</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Left In Drawer:</p><p>$50</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full  mt-5' style={{fontSize: `${drawerFontSize}pt`}}><p>Expected Cash In Drawer:</p><p>$1320</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Actual Cash In Drawer:</p><p>$1320</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Closing Discrepancy:</p><p>$0</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Discrepancy Reason:</p><p>{'_'}</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full mt-5' style={{fontSize: `${drawerFontSize}pt`}}><p>Cash Sales:</p><p>$1000</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Other Sales:</p><p>$740</p></div>
                                        <div className='flex justify-between items-center text-[10px] w-full' style={{fontSize: `${drawerFontSize}pt`}}><p>Total Sales:</p><p>$1740</p></div>
                                    </div>
                                    <p className='text-md text-left !font-varela_Round font-semibold text-dark dark:text-white-dark mt-4'>Taxes</p>
                                    <div className="flex flex-col justify-between items-start text-[10px] mb-3 w-full">
                                        <div className='flex justify-between items-center text-[10px] w-full pl-4'>
                                            <p>Cannabis Tax - VERIFY - 7%  </p>
                                            <p>$20.22</p>
                                        </div>
                                        <div className='flex justify-between items-center text-[10px] w-full pl-4'>
                                            <p>Sales Tax - VERIFY - 10.75%</p>
                                            <p>$30.02</p>
                                        </div>
                          
                                        {/* <div className='flex justify-between items-center text-[10px]'><p>Cash Sales:</p><p>{formatCurrency(drawerReportData?.cashPayments)}</p></div>
                                        <div className='flex justify-between items-center text-[10px]'><p>Taxed:</p><p>{formatCurrency(drawerReportData?.otherPayments)}</p></div>
                                        <div className='flex justify-between items-center text-[10px]'><p>Sales Tax:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div> */}
                                        <div className='flex justify-between items-center text-[10px] w-full'><p>Tax Total:</p><p>$100</p></div>
                                    </div>
                                    <div className="flex flex-col justify-between items-start text-[10px] mb-3 w-full">
                                        {/* <div className='flex justify-between items-center text-[10px]'><p>Net Cash:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div>
                                        <div className='flex justify-between items-center text-[10px]'><p>Net Card Payments:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div>
                                        <div className='flex justify-between items-center text-[10px]'><p>Net Other Payments:</p><p>{formatCurrency(drawerReportData?.totalPayments)}</p></div> */}
                                        <div className='flex justify-between items-center text-[10px] w-full'><p>Net Sales:</p><p>$1740</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Money Drop  */}
                    <div className="flex flex-col md:flex-row gap-8 p-4 mx-auto">
                        <div className="flex-1">
                            <h2 className="text-gray-400 text-lg font-medium mb-4">Money Drop</h2>

                            <div className="w-full flex justify-between items-center">
                                <label htmlFor="isSetMoneyDrop" className="text-left dark:text-white-dark text-dark mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2 text-nowrap">
                                    Disable Money Drop
                                </label>
                                <label className="relative h-6 w-12 mt-2">
                                    <input
                                        type="checkbox"
                                        className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                                        id="isSetMoneyDrop"
                                        defaultChecked={disableMoneyDropPrint}
                                        onChange={() => {
                                            setDisableMoneyDropPrint(!disableMoneyDropPrint);
                                        }}
                                    />
                                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                </label>
                            </div>

                            {/* Dimensions */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Dimensions (Inches)</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">W</span>
                                        <input type="number" step="0.01" min="0" value={moneyDropWidth} onChange={(e) => setMoneyDropWidth(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">H</span>
                                        <input type="number" step="0.01" min="0" value={moneyDropHeight} onChange={(e) => setMoneyDropHeight(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                </div>
                            </div>

                            {/* Margins */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Margins (Inches)</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">T</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={moneyDropTopMargin}
                                            onChange={(e) => setMoneyDropTopMargin(parseFloat(e.target.value) || 0)}
                                            className="w-full form-input no-spinner"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">R</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={moneyDropRightMargin}
                                            onChange={(e) => setMoneyDropRightMargin(parseFloat(e.target.value) || 0)}
                                            className="w-full form-input no-spinner"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">B</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={moneyDropBottomMargin}
                                            onChange={(e) => setMoneyDropBottomMargin(parseFloat(e.target.value) || 0)}
                                            className="w-full form-input no-spinner"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-8 text-center">L</span>
                                        <input type="number" step="0.01" min="0" value={moneyDropLeftMargin} onChange={(e) => setMoneyDropLeftMargin(parseFloat(e.target.value) || 0)} className="w-full form-input no-spinner" />
                                    </div>
                                </div>
                            </div>

                            {/* Font Size */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Font Size</label>
                                </div>
                                <div className="flex items-center">
                                    <input type="number" step="0.01" min="8" value={moneyDropFontSize} onChange={(e) => setMoneyDropFontSize(parseFloat(e.target.value) || 0)} className="w-full rounded-l-md rounded-r-none form-input no-spinner" />
                                    <span className="bg-gray-200 dark:bg-dark rounded-r-md rounded-l-none dark:text-white text-dark px-4 py-[9px]">pt</span>
                                </div>
                            </div>

                            {/* Top Text */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Top Text</label>
                                </div>
                                <input type="text" value={moneyDropTopText} onChange={(e) => setMoneyDropTopText(e.target.value)} placeholder="Example: Money Drop Receipt" className="w-full form-input" />
                            </div>

                            {/* Bottom Text */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="font-medium">Bottom Text</label>
                                </div>
                                <textarea value={moneyDropBottomText} onChange={(e) => setMoneyDropBottomText(e.target.value)} placeholder="Example: Keep this receipt for your records." className="w-full form-input h-32" />
                            </div>
                            <div className="flex justify-end items-center mx-3">
                                <button className="btn btn-primary px-16 mb-2" onClick={() => handleSaveMoneyDropPrintSetting()}>
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="flex-1">
                            <div className="flex justify-end mb-4">
                                <button className="btn btn-outline-primary" onClick={() => handleMoneyDropPrint()}>
                                    Print Sample Money Drop
                                </button>
                            </div>

                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="flex justify-end mb-4 gap-4">
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                    </button>
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                            <rect x="6" y="14" width="12" height="8"></rect>
                                        </svg>
                                    </button>
                                    <button className="text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="1"></circle>
                                            <circle cx="19" cy="12" r="1"></circle>
                                            <circle cx="5" cy="12" r="1"></circle>
                                        </svg>
                                    </button>
                                </div>

                                <div
                                    className="bg-white dark:bg-black p-4 rounded overflow-hidden" 
                                    style={{
                                        width: moneyDropWidth ? `${moneyDropWidth}in` : '200px',
                                        height: moneyDropHeight ? `${moneyDropHeight}in` : '100%',
                                        margin: `${moneyDropTopMargin}in ${moneyDropRightMargin}in ${moneyDropBottomMargin}in ${moneyDropLeftMargin}in`,
                                        fontSize: `${moneyDropFontSize}pt`,
                                        fontFamily: 'Open Sans, Roboto, Arial, sans-serif'
                                    }}
                                    ref={moneyDropContentRef}
                                >
                                    {moneyDropTopText && (
                                        <div className="text-center mb-3" style={{fontSize: `${moneyDropFontSize}pt`}}>
                                            {moneyDropTopText}
                                        </div>
                                    )}
                                    
                                    <h1 className='text-lg font-semibold text-black dark:text-white-dark' style={{fontSize: `${Math.max(moneyDropFontSize, 12)}pt`}}>Highway Cannabis</h1>
                                    <h1 className='text-lg font-semibold text-black dark:text-white-dark' style={{fontSize: `${Math.max(moneyDropFontSize, 12)}pt`}}>Register 1</h1>
                                    <div className="flex flex-col justify-between items-start mb-3 mt-3 w-full">
                                        <div className='flex justify-start items-center leading-none' style={{fontSize: `${Math.max(moneyDropFontSize - 6, 8)}pt`}}>
                                            <p className='font-semibold'>User:</p>
                                            <p className='ml-2'>John Doe</p>
                                        </div>
                                        <div className='flex justify-start items-center leading-none' style={{fontSize: `${Math.max(moneyDropFontSize - 6, 8)}pt`}}>
                                            <p className='font-semibold'>Drop Type:</p>
                                            <p className='ml-2'>Drop Out</p>
                                        </div>
                                        <div className='flex justify-start items-center leading-none' style={{fontSize: `${Math.max(moneyDropFontSize - 6, 8)}pt`}}>
                                            <p className='font-semibold'>Drop Amount:</p>
                                            <p className='ml-2'>$100.00</p>
                                        </div>
                                        <div className='flex justify-start items-center leading-none' style={{fontSize: `${Math.max(moneyDropFontSize - 6, 8)}pt`}}>
                                            <p className='font-semibold'>Drop Reason:</p>
                                            <p className='ml-2'>End of shift deposit</p>
                                        </div>
                                        <div className='flex justify-start items-center leading-none' style={{fontSize: `${Math.max(moneyDropFontSize - 6, 8)}pt`}}>
                                            <p className='font-semibold'>Time:</p>
                                            <p className='ml-2'>{new Date().toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {moneyDropBottomText && (
                                        <div className="text-center mt-3" style={{fontSize: `${moneyDropFontSize}pt`}}>
                                            {moneyDropBottomText}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>                   
                </div>
        </PerfectScrollbar>
    );
}
