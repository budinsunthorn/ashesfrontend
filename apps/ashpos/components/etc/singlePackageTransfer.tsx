'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaRegQuestionCircle } from 'react-icons/fa';
import { ImPencil } from 'react-icons/im';
import { userDataSave } from '@/store/userData';
import { FaChevronDown } from 'react-icons/fa';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import { IoCalendarNumberOutline } from 'react-icons/io5';
import {
    useGetProductRowsByNameSearchQuery,
    useGetMjProductRowsByNameSearchQuery,
    useAssignPackageToProductMutation,
    useAllProductsByDispensaryIdQuery,
    useGetNonMjProductRowsByNameSearchQuery,
    useAssignNonMjPackageToProductMutation,
    useProductQuery,
} from '@/src/__generated__/operations';
import { useDebouncedCallback } from 'use-debounce';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { FaMagic } from 'react-icons/fa';
import Tippy from '@tippyjs/react'; 
import 'tippy.js/dist/tippy.css';
import PackageStatusBadge from './packageStatus';
import ProductCategory from './productCategory';
import { truncateToTwoDecimals } from '@/lib/utils';

import { Store } from 'react-notifications-component';

import { quantityAbbreviations } from '@/utils/variables';
import ProductRegisterModal from '../modals/productRegisterModal';

// import { CalendarIcon, ChevronDownIcon, PencilIcon, QuestionMarkCircleIcon } from 'lucide-react'

interface ProductCardProps {
    metrcTag: string;
    name: string;
    category: string;
    metrcQty: string;
    unitWeight: string;
    storageLocation: string;
    packageId: string;
    product: string;
    quantity: number;
    cost: number;
    netPrice: number;
    margin: number;
    profitPerSale: number;
    totalCost: number;
}

export default function SinglePackageTransfer({ packageData, handleRefetchPackage, transferId, mtcTransferId, isMj }: any) {
    const { userData } = userDataSave();
    const userId = userData.userId
    const dispensaryId = userData.dispensaryId;
    const [searchValue, setSearchValue] = useState<string>('');
    const [showProduct, setShowProduct] = useState(false);
    const [searchParam, setSearchParam] = useState('a');
    const [isShowError, setIsShowError] = useState(false);
    const [cost, setCost] = useState(0);
    const [quantity, setQuantity] = useState(packageData.package?.originalQty);
    const [productId, setProductId] = useState('');
    const [productName, setProductName] = useState('');
    const [productUnit, setProductUnit] = useState('');
    const [price, setPrice] = useState(0);
    const [isAssigned, setIsAssigned] = useState(false);
    const [isSelled, setIsSelled] = useState(false);
    const [modalShow,setModalShow] = useState(false)
    const [currentProduct, setCurrentProduct] = useState<any>({});

    console.log('packageData', packageData);
    const inputRef = useRef<HTMLInputElement | null>(null);
    let productData;
    //  Fetch Data
    if (isMj) {
        const allProductRowsByNameSearchQuery = useGetMjProductRowsByNameSearchQuery({ searchQuery: searchParam, dispensaryId: dispensaryId });
        productData = allProductRowsByNameSearchQuery.data?.getMjProductRowsByNameSearch;
    } else {
        const allNonMjProductByNameSearchQuery = useGetNonMjProductRowsByNameSearchQuery({ searchQuery: searchParam, dispensaryId: dispensaryId });
        productData = allNonMjProductByNameSearchQuery.data?.getNonMjProductRowsByNameSearch;
    }
    // console.log("productId", productId);
    // const productRowById = useProductQuery({id: productId});
    // const productById = productRowById.data?.product;
    // console.log("productById", productById)
    // console.log("productData", productData)
    // const allProductsByDispensaryId = useAllProductsByDispensaryIdQuery({dispensaryId: dispensaryId})
    // const allProductsData = allProductsByDispensaryId.data?.allProductsByDispensaryId
    const [currentProductData, setCurrentProductData] = useState({
        id: '',
        dispensaryId: '',
        dispensary: {
            name: '',
        },
        userId: '',
        user: {
            name: '',
            email: '',
            phone: '',
        },
        supplierId: '',
        supplier: {
            name: '',
            email: '',
            phone: '',
        },
        itemCategoryId: '',
        itemCategory: {
            name: '',
            color: '',
        },
        name: '',
        sku: '',
        upc: '',
        price: 0,
        productUnitOfMeasure: 'g',
        unitOfNetWeight: 'g',
        unitOfUnitWeight: 'g',
        isApplyUnitWeight: false,
        unitWeight: 0,
        netWeight: 0,
        createdAt: '',
        updatedAt: '',
    });


    console.log("currentProduct", currentProduct)

    // Mutation
    const assignPackage = useAssignPackageToProductMutation();
    const nonMjAssignPackage = useAssignNonMjPackageToProductMutation();
    // Generate 10 digists randome number
    function generateRandomNDigitNumber(n: number) {
        let randomNumber = '';
        for (let i = 0; i < n; i++) {
            randomNumber += Math.floor(Math.random() * 10); // Generates a digit between 0 and 9
        }
        return randomNumber;
    }

    const handleSearch = useDebouncedCallback((term) => {
        setSearchParam(term.trim());
    }, 500);

    // useEffect(() => {
    //     setSearchValue(productById?.name || "");
    //     setProductUnit(productById?.unitOfMeasure || "");
    // },[productById])

    useEffect(() => {
        console.log('packageData?.assignPackage?.product?.name', packageData?.assignPackage?.product?.name);
        // setProductId(packageData?.assignPackage?.productId);
        setCost(packageData?.assignPackage?.cost);
        setQuantity(packageData?.originalQty);
        setSearchValue(packageData?.assignPackage?.product?.name || '');
        setCurrentProduct({id: packageData?.assignPackage?.product?.id})
        setProductUnit(packageData?.UnitOfMeasureName || '');

        //     const product = allProductsData&&allProductsData?.filter((data) => data?.id == packageData.package?.productId)
        //     setProductName(product&&product[0]?.name || "")
        //     setPrice(product&&product[0]?.price || 0)
        //     // inputRef.current?.value = product&&product[0]?.name
        // }
        const isSelled = (packageData.assignPackage && (packageData?.originalQty > packageData?.assignPackage?.posQty))
        const isAssigned = (packageData.assignPackage)

        setIsAssigned(isAssigned);
        setIsSelled(isSelled)

    }, [packageData]);

    const handleAssignPackage = async () => {
        if (currentProduct.id == null || cost == 0 || cost == undefined || quantity == 0 || quantity == undefined) {
            setIsShowError(true);
            return;
        }
        await assignPackage.mutate(
            {
                input: {
                    packageLabel: packageData.packageLabel.toString(),
                    cost: Number(truncateToTwoDecimals(cost)),
                    dispensaryId: dispensaryId,
                    productId: currentProduct.id,
                    quantity: Number(truncateToTwoDecimals(quantity !== null && typeof quantity === 'number' ? quantity : 0)),
                    userId: userData.userId,
                    // metrcTransferId: mtcTransferId,
                    transferId: transferId || null,
                },
            },
            {
                onError(error) {
                    // setSpinnerStatus({})
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    // successAlert('Package Assign Success.');
                    Store.addNotification({
                        title: "Success",
                        message: `Package Assign Success!`,
                        type: "success",
                        insert: "bottom",
                        container: "bottom-left",
                        animationIn: ["animate__animated", "animate__fadeIn"],
                        animationOut: ["animate__animated", "animate__fadeOut"],
                        dismiss: {
                            duration: 4000,
                            onScreen: true
                        }
                    });
                    handleRefetchPackage();
                },
                onSettled() {
                    // setIsSaveButtonDisabled(false);
                },
            }
        );
    };
    const handleNonMjAssignPackage = async () => {
        console.log("cost, quantity >>>>>>>>", cost, quantity)
        if (currentProduct.id == null || cost == 0 || cost == undefined || quantity == 0 || quantity == undefined) {
            setIsShowError(true);
            return;
        }
        await nonMjAssignPackage.mutate(
            {
                input: {
                    cost: cost,
                    dispensaryId: dispensaryId,
                    productId: currentProduct.id,
                    quantity: quantity || 0,
                    userId: userData.userId,
                    transferId: transferId,
                    packageId: packageData.id,

                    // cost: Scalars['Float']['input'];
                    //     dispensaryId: Scalars['String']['input'];
                    //     packageId: Scalars['String']['input'];
                    //     productId: Scalars['String']['input'];
                    //     quantity: Scalars['Float']['input'];
                    //     transferId: Scalars['String']['input'];
                    //     userId: Scalars['String']['input'];
                },
            },
            {
                onError(error) {
                    // setSpinnerStatus({})
                    warnAlert('Package Assign Failed.');
                },
                onSuccess(data) {
                    Store.addNotification({
                        title: "Success",
                        message: `Package Assign Success!`,
                        type: "success",
                        insert: "bottom",
                        container: "bottom-left",
                        animationIn: ["animate__animated", "animate__fadeIn"],
                        animationOut: ["animate__animated", "animate__fadeOut"],
                        dismiss: {
                            duration: 4000,
                            onScreen: true
                        }
                    });
                    handleRefetchPackage();
                },
                onSettled() {
                    // setIsSaveButtonDisabled(false);
                },
            }
        );
    };
    console.log('searchValue', searchValue);

    return (
        <div className={`bg-white dark:bg-[#0f1727] rounded-lg shadow-md p-6 mx-auto mb-2 ${packageData?.assignPackage ? "" : 
'!border-danger !border-2'}`}>
            {isMj ? <h2 className="text-sm text-dark dark:text-white-dark">Metrc Tag</h2> : null}
            <div className="flex justify-between items-center mb-4">
                <div className="flex justify-start items-center">
                    {isMj ? (
                        <div>
                            <div className="flex justify-start items-center mr-2">
                                <p className="text-lg font-semibold text-dark dark:text-white-dark">{packageData?.packageLabel}</p>
                            </div>
                        </div>
                    ) : // <div className='mr-2'>{packageData?.id.toUpperCase()}</div>
                    null}
                    {/* <span className={`px-3 py-0 rounded-full text-sm font-bold ${packageData?.package?.packageStatus == 'ACTIVE'
                                ? 'bg-theme_green text-white dark:text-green-900'
                                : packageData?.package?.packageStatus == 'PENDING'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                : packageData?.package?.packageStatus == 'HOLD' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-dark text-gray-100 dark:text-gray-800'}`}>{packageData?.package?.packageStatus}
                    </span>  */}
                    {isMj ? <PackageStatusBadge packageStatus={packageData?.packageStatus} /> : <PackageStatusBadge packageStatus={packageData?.packageStatus} />}
                    {(packageData?.assignPackage) ? null : 
                    <div className="flex justify-start items-center ml-1">
                        <span className="badge text-warning bg-warning-light dark:bg-warning-dark mr-2">Incomplete</span>
                    </div>
                    }
                </div>
                {/* {packageData?.package?.originalQty == packageData?.package?.posQty ?  */}
                {isAssigned && isSelled ? <span className='badge text-success bg-success-light dark:bg-success-dark-light rounded-lg'>Selling Started</span> 
                :
                isAssigned && !isSelled ? 
                    <button
                    className="btn btn-outline-secondary px-5 py-2 rounded-md text-sm"
                    onClick={() => {
                        setIsAssigned(false)
                        setIsSelled(false)
                    }}
                >
                    Edit
                </button>
                : 
                <button
                    className="btn btn-outline-primary px-5 py-2 rounded-md text-sm"
                    onClick={() => {
                        isMj ? handleAssignPackage() : handleNonMjAssignPackage();
                    }}
                >
                    Save
                </button>}
                {/* : 
                <Tippy content="This package has been sold and can not be changed" placement='top'>
                    <button className="btn btn-outline-primary px-5 py-2 rounded-md text-sm opacity-60 cursor-not-allowed">
                        Save
                    </button>
                </Tippy>
                } */}
            </div>

            {isMj ? (
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex flex-row justify-start items-center">
                        <h3 className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3">Name:</h3>
                        <p className="text-sm text-dark dark:text-white-dark">{packageData.package?.itemName}</p>
                    </div>
                    <div className="flex flex-row justify-start items-center">
                        <h3 className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3">Category:</h3>
                        {/* <p className="text-sm text-dark dark:text-white-dark">{packageData.package?.itemProductCategoryName}</p> */}
                        {/* <ProductCategory name={packageData.package?.itemProductCategoryName} color={packageData.package?.color}/> */}
                    </div>
                    <div className="flex flex-row justify-start items-center">
                        <h3 className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3">Metrc Qty:</h3>
                        <p className="text-sm text-dark dark:text-white-dark">{packageData.package?.originalQty}&nbsp;{quantityAbbreviations[packageData.package?.UnitOfMeasureAbbreviation]}</p>
                    </div>
                    {/* <div className="flex flex-row justify-start items-center">
                    <h3 className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3">Unit Weight:</h3>
                    <p className="text-sm text-dark dark:text-white-dark">{packageData.package?.itemUnitWeightUnitOfMeasureName}</p>
                </div> */}
                    <div className="flex flex-row justify-start items-center">
                        <h3 className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3">Metrc Storage Location:</h3>
                        <p className="text-sm text-dark dark:text-white-dark">{packageData.package?.LocationName}</p>
                    </div>
                </div>
            ) : null}

            {/* <hr className="my-2" /> */}

            <div className="w-full flex my-4">
                <div className="w-[20%] pr-2">
                    <label className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3 flex items-center">
                        Package ID <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            value={isMj ? packageData?.packageLabel?.slice(-10).toUpperCase() : packageData?.id.slice(-10).toUpperCase()}
                            readOnly={packageData?.package?.packageStatus == 'Finished'}
                            className="form-input ltr:rounded-r-none rtl:rounded-l-none"
                        />
                        {/* <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            <FaMagic className="w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                        </div> */}
                    </div>
                </div>
                <div className="w-[40%] px-2">
                    <label className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3 flex items-center">
                        Product <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex w-full">
                        <div className={`relative border-[1] border-gray-300 rounded-r-none w-full ${isShowError && searchValue == '' ? 'has-error' : ''}`}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchValue}
                                placeholder="Select a product"
                                className={`peer w-full form-input rounded-r-none`}
                                onChange={(e) => {
                                    handleSearch(e.target.value);
                                    setSearchValue(e.target.value);
                                }}
                                disabled={isAssigned || isSelled}
                                onFocus={() => setShowProduct(true)}
                                readOnly={packageData?.packageStatus == 'Finished'}
                            ></input>
                            {showProduct ? <button type="button" className="absolute top-1/2 right-3 -translate-y-1/2 btn btn-outline-primary btn-sm ml-2 rtl:mr-2 p-2 shadow shadow-indigo-500/50" onClick={() => {if(setModalShow) setModalShow(true)}}>
                                                    <FaPlus />
                                                </button> : null}
                            {!showProduct ? null : (
                                <div className="absolute top-[100%] left-0 w-full border-[1px] bg-gray-100 dark:bg-[#141e33] border-gray-200 max-h-[200px] flex-col items-center hidden peer-focus:block hover:block dark:border-[#1d2c46] z-[10]">
                                    <PerfectScrollbar className="overflow-y-auto">
                                        {productData ? (
                                            productData.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="w-full flex justify-between items-center max-h-[500px] bg-white shadow-md shadow-gray-200  px-2 py-2 cursor-pointer hover:bg-gray-100 dark:bg-[#121c2c] dark:hover:bg-[#18253a]  dark:shadow-[#11161d]"
                                                    onClick={() => {
                                                        setCurrentProduct(item || {});
                                                        setSearchParam('');
                                                        setSearchValue(item?.name || '');
                                                        setProductUnit(item?.productUnitOfMeasure || '');
                                                        setShowProduct(false);
                                                        setPrice(item?.price || 0);
                                                    }}
                                                >
                                                    {item?.name}
                                                    <span className='text-xs'>1{item?.productUnitOfMeasure}&nbsp;&nbsp;${item?.price}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div></div>
                                        )}
                                    </PerfectScrollbar>
                                </div>
                            )}
                        </div>
                        <button
                            className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] hover:text-dark dark:text-white-dark cursor-pointer"
                            onClick={() => inputRef.current?.focus()}
                        >
                            <FaChevronDown className="w-4 text-gray-400 " />
                        </button>
                    </div>
                    <p className="text-sm py-2">
                        ${truncateToTwoDecimals(price)} Net Price | {packageData.margin} | ${packageData.isConnectedWithProduct ? price - packageData.cost : price - cost} Profit/Sale
                    </p>
                </div>
                <div className="w-[20%] px-2">
                    <label className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3 flex items-center">
                        Quantity <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className={`flex  ${isShowError && (quantity == 0 || quantity == undefined) ? 'has-error' : ''}`}>
                        <input
                            type="number"
                            step="0.01"
                            // placeholder={packageData.package?.originalQty}
                            value={quantity}
                            disabled={isAssigned || isSelled}
                            readOnly={packageData?.packageStatus == 'Finished'}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className={`form-input ltr:rounded-r-none rtl:rounded-l-none no-spinner`}
                        />
                        <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            <span className="text-gray-400">{productUnit}</span>
                        </div>
                    </div>
                </div>
                <div className="w-[20%] px-2">
                    <label className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3 flex items-center">
                        Cost <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className={`flex ${isShowError && (cost == 0 || cost == undefined) ? 'has-error' : ''}`}>
                        <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            $
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            placeholder=""
                            value={cost}
                            readOnly={packageData?.package?.packageStatus == 'Finished'}
                            disabled={isAssigned || isSelled}
                            onChange={(e) => setCost(Number(e.target.value))}
                            className={`form-input rounded-none no-spinner`}
                        />
                        <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                            <span className="text-gray-400">/{productUnit}</span>
                        </div>
                    </div>
                    <p className="text-sm py-2">
                        Total cost: $
                        {packageData.package?.isConnectedWithProduct
                            ? truncateToTwoDecimals(packageData.package?.originalQty * packageData.package?.assignPackage?.cost)
                            : quantity !== null && typeof quantity === 'number'
                            ? truncateToTwoDecimals(quantity * cost)
                            : 0}
                    </p>
                </div>
                {/* <div>
          <label className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3 flex items-center">
            Cost <FaRegQuestionCircle className="h-4 w-4 text-gray-400 ml-1" />
          </label>
          <div className="flex items-center mt-1">
            <span className="p-2 text-gray-400">$</span>
            <input type="number" value={cost} readOnly className="p-2 w-full form-input rounded-none" />
            <button className="p-2">
              <FaChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div> */}
            </div>

            {/* <div className="flex justify-between items-center mb-4"><p className="text-sm">QF {packageData.quantity} Each</p></div> */}

            {/*<div className="grid grid-cols-2 gap-4">
       <div>
          <label className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3 flex items-center">
            Batch ID <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex">
            <input type="text" value={packageData.packageId} readOnly className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
              <FaChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm text-dark dark:text-white-dark font-varela_Round font-semibold mr-3">Expires</label>
          <div className="flex items-center border rounded mt-1">
            <input type="text" className="p-2 w-full" placeholder="Select date" />
            <button className="p-2">
              <IoCalendarNumberOutline className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div> */}

            {/* <div className="mt-4 flex justify-end">
                <button className="text-blue-600 hover:underline">Edit Package Details</button>
            </div> */}
            <ProductRegisterModal
                setModalShow={setModalShow}
                modalShow={modalShow}
                modalMode={'new'}
                currentProduct={currentProductData}
                userId={userId}
                dispensaryId={dispensaryId}
            />
        </div>
    );
}
