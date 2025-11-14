'use client';
import React, { Fragment, useEffect, useState, useRef, Suspense, useCallback } from 'react';
import IconX from '@/components/icon/icon-x';
import PanelCodeHighlight from '@/components/panel-code-highlight';
import successAlert from '@/components/notification/successAlert';
import notification from '@/components/notification/notification';
import { useSearchParams } from 'next/navigation';
import MaskedInput from 'react-text-mask';
import { formatInTimeZone } from 'date-fns-tz';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '@/styles/flatpickr-dark.css';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper as SwiperType } from 'swiper/types';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Transition, Dialog } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { useAtom } from 'jotai';
import Moment from 'moment';
import { useReactToPrint } from 'react-to-print';

// Store
import { IRootState } from '@/store';
import { currentDrawerAtom } from '@/store/currentDrawer';
import { ActiveSidebarItemAtom } from '@/store/activeSidebarItem';
import { orderListUpdated } from '@/store/orderListUpdated';
import { customerIdAtom } from '@/store/customerId';

import { Store } from 'react-notifications-component';
import Decimal from 'decimal.js';  

// Query
import {
    useAllCustomersByDispensaryIdQuery,
    useAllOrdersByDispensaryIdAndDateQuery,
    useDispensaryQuery,
    useAllOrderItemsByOrderIdQuery,
    useOrderQuery,
    useCreateOrderMutation,
    useCreateOrderItemMutation,
    useUpdateCustomerByOrderIdMutation,
    useDeleteOrderItemMutation,
    useDeleteOrderItemsByOrderIdMutation,
    useGetPackageRowsByItemSearchQuery,
    useGetProductRowsByNameSearchQuery,
    useHoldOrderMutation,
    useAllOrdersForCurrentDrawerQuery,
    useAllOrdersByDrawerIdQuery,
    useCompleteOrderMutation,
    useAllOrderNumbersByDispensaryIdAndCustomerIdWithPagesQuery,
    useUpdateOrderToReturnMutation,
    useSetRestockForOrderItemMutation,
    useCreateOrderItemForReturnMutation,
    useOrderForReturnQuery,
    useReturnOrderMutation,
    useOrderWithTaxSumQuery,
    useUnHoldOrderMutation,
    useAllDiscountsByDispensaryIdQuery,
    useSetDiscountForOrderMutation,
    useCancelDiscountForOrderMutation,
    useCancelOrderMutation,
    useAllLoyaltiesByDispensaryIdQuery,
    useSetLoyaltyForOrderMutation,
    useCancelLoyaltyForOrderMutation,
    useGetProductAndPackagesByNameSearchQuery,
    useGetPurchaseLimitByDispensaryIdQuery,
    useDrawerInfoByDrawerIdQuery,
    useAllCustomersByDispensaryIdAndNameAndLicenseSearchQuery,
    useUpdateTaxHistoryForOrderMutation,
    CustomerStatus,
    MfType,
    ProductUnitOfMeasure,
    useGetEditOrderByDrawerIdQuery,
    useAllItemCategoriesByDispensaryIdQuery,
} from '@/src/__generated__/operations';

import { LoyaltyType } from '@/src/__generated__/operations';
// Module
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { isAction } from '@reduxjs/toolkit';
import warnAlert from '../notification/warnAlert';
import { useDebouncedCallback } from 'use-debounce';
import { Tab } from '@headlessui/react';

import { userDataSave } from '@/store/userData';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

// Component
import ProductCategory from '../etc/productCategory';
import CustomerType from '../etc/customerType';
import SearchableSelect from '../etc/searchableSelect';
import RefreshButton from '../etc/refreshButton';
import CheckoutPanel from '../etc/checkoutPanel';
import CustomSelect from '../etc/customeSelect';
import CustomerRegisterModal from '../modals/customerRegisterModal';
import UserCaption from '../etc/userCaption';
import ItemCategory from '@/app/org/[organizationId]/[storeLinkName]/(defaults)/admin/register/itemCategory/page';
// Icon
import { FaCheckCircle, FaExclamationTriangle, FaRegArrowAltCircleLeft, FaRegTimesCircle, FaTimes } from 'react-icons/fa';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import { FaCheck, FaDiagramNext, FaPeopleGroup, FaPrint, FaUserLarge } from 'react-icons/fa6';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { FaAngleRight } from 'react-icons/fa6';
import { FaAnglesRight } from 'react-icons/fa6';
import { FaAngleLeft } from 'react-icons/fa6';
import { FaAnglesLeft } from 'react-icons/fa6';
import { RxCross1, RxQuestionMarkCircled } from 'react-icons/rx';
import { RiHistoryFill } from 'react-icons/ri';
import { PiClockClockwiseFill } from 'react-icons/pi';
import { FaHandHoldingUsd, FaPlus } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdOutlineCancel, MdOutlineLoyalty, MdSettingsInputAntenna } from 'react-icons/md';
import { TbShoppingBagDiscount, TbTruckReturn } from 'react-icons/tb';
import { MdOutlineShoppingCartCheckout } from 'react-icons/md';
import { HiChevronDoubleRight, HiChevronRight } from 'react-icons/hi';
import { MdOutlineClear } from 'react-icons/md';
import IconSearch from '@/components/icon/icon-search';
import IconXCircle from '@/components/icon/icon-x-circle';
import IconCircleCheck from '../icon/icon-circle-check';
import { RiUserSearchFill } from 'react-icons/ri';
import { IoIosArrowDown, IoIosArrowUp, IoIosDesktop, IoIosReturnLeft, IoMdPerson } from 'react-icons/io';
import { FcIpad } from 'react-icons/fc';
import { MdOutlinePhoneIphone } from 'react-icons/md';
// import { TbDeviceIpadFilled } from "react-icons/tb";
import { IoDesktop, IoDesktopOutline } from 'react-icons/io5';

import { convertPSTTimestampToTimezone, getCurrentDateByTimezone } from '@/utils/datetime';
import { divide } from 'lodash';
import DiscountLabel from '../etc/discountLabel';
import BirthdayAlert from '../etc/birthdayAlert';
import Dropdown from '../dropdown';
import { Fanwood_Text } from 'next/font/google';
import BarcodeScanner from '../etc/barcodeScan';
import Link from 'next/link';
import OrderStatusBadge from '../etc/OrderStatusBadge';
import ExitLabelPrint from '../Print/exitLabelPrint';
import ReceiptPrint from '../Print/receiptPrint';
import { quantityAbbreviations } from '@/utils/variables';
import CustomUserSelect from '../etc/customeUserSelect';
import { truncateToTwoDecimals, setFourDecimals } from '@/lib/utils';
import { getCurrentTimeByTimezone } from '@/utils/datetime';
import { LiaCannabisSolid } from 'react-icons/lia';
import CategorySelect from '../etc/CategorySelect';
import Cookies from 'universal-cookie';
import { CiBarcode } from 'react-icons/ci';

SwiperCore.use([Autoplay, Navigation, Pagination]);
interface SwiperRef extends SwiperCore {}
interface orderType {
    value: number;
    text: string;
    status: string;
}

interface customerInfo {
    name: string;
    isMedical: boolean;
}

type Product = {
    name: string;
    price: number;
    itemCategory: {
        id: string;
        name: string;
        color: string;
    };
};

interface ItemCategory {
    name: string;
    color: string;
    metrcCategory: string;
    containMj: boolean;
}

interface IncomingItem {
    id: string;
    name: string;
    sku?: string | null;
    upc?: string | null;
    price: number;
    itemCategory: ItemCategory;
    stock?: number | null;
    unitWeight: number;
    unitOfMeasure: any;
}

type IncomingData = (IncomingItem | null)[];

interface InventoryItem {
    id: string;
    itemName: string;
    itemProductCategoryName: string;
    Quantity: number;
    UnitOfMeasureAbbreviation: string;
}
interface OrderItemInventory {
    [orderId: string]: {
        [packageLabel: string]: {
            originalQty: number;
            currentQty: number;
        };
    };
}

type InventoryData = (InventoryItem | null)[];

type CalculationType = 'percent' | 'amount' | 'to-amount';

type RowDataType = {
    id: string;
    name: string;
    MFType: MfType;
    birthday: string;
    email: string;
    phone: string;
    isActive: boolean;
    driverLicense: string;
    driverLicenseExpirationDate: string;
    isMedical: boolean;
    isTaxExempt: boolean;
    loyaltyPoints: number;
    status: CustomerStatus;
    medicalLicense: string;
    medicalLicenseExpirationDate: string;
    createdAt: string;
    updatedAt: string;
};

interface OrderItemInventoryType {  
    [key: string]: { currentQty: number };  
}  

interface OrderItemInventoryData {  
    [key: string]: OrderItemInventoryType;  
} 

const cookies = new Cookies();

const Cashier = (props: any) => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const queryClient = useQueryClient();
    const { userData } = userDataSave();
    const searchParams = useSearchParams();
    const [isCustomerExpired, setIsCustomerExpired] = useState(false);

    const [isCompleteOrder, setIsCompleteOrder] = useState(false);

    const receiptPrintButtonRef = useRef<HTMLDivElement>(null);
    const exitLabelPrintButtonRef = useRef<HTMLDivElement>(null);

    const dispensaryId = userData.dispensaryId;
    const userTimeZone = userData.storeTimeZone;

    const userId = userData.userId;
    const storeTimeZone = userData.storeTimeZone;
    const currentTime = getCurrentTimeByTimezone(storeTimeZone);
    const currentDate = getCurrentDateByTimezone(storeTimeZone);

    const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
    const [currentDay, setCurrentDay] = useState<Date>(new Date(currentDate));
    const [orderNumber, setOrderNumber] = useState<number>(0);
    const [isChangeDate, setIsChangeDate] = useState(false);
    const [isNewOrderButtonDisabled, setIsNewOrderButtonDisabled] = useState(false);
    const [isNewOrderItemButtonDisabled, setIsNewOrderItemButtonDisabled] = useState(false);
    const [isDeleteOrderItemButtonDisabled, setIsDeleteOrderItemButtonDisabled] = useState(false);
    const [isCustomerSelectShow, setIsCustomerSelectShow] = useState(false);
    const [search, setSearch] = useState('');
    const [showCheckOut, setShowCheckOut] = useState(false);
    const [payAmount, setPayAmount] = useState(0); //payment amount selected in checkout panel
    const [otherAmount, setOtherAmount] = useState(0);
    const [isCashed, setIsCashed] = useState(false); //flag if cashed or uncashed
    const swiperRef = useRef<any>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [term, setTerm] = useState<string>('');
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [orderHistoryPage, setOrderHistoryPage] = useState(1);
    const [showUserCaption, setShowUserCaption] = useState(false);
    const [showOrderList, setShowOrderList] = useState(false);
    const [birthdayShow, setBirthdayShow] = useState(false);
    const [cancelOrderItemId, setCancelOrderItemId] = useState('');
    const [showCancelOrderItemModal, setShowCancelOrderItemModal] = useState(false);
    const [showPackageInventoryWarning, setShowPackageInventoryWarning] = useState(false);
    const [packageInventoryWarningMessage, setPackageInventoryWarningMessage] = useState('');   
    const [customerOptions, setCustomerOptions] = useState<any[]>([]);
    const [isIpadMode, setIsIpadMode] = useState(false);
    const [isShowingIpadProduct, setIsShowingIpadProduct] = useState(false);

    // Intersection Observer for infinite scroll
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const loadMoreRefIpad = useRef<HTMLDivElement>(null);

    const [currentOrder, setCurrentOrder] = useState({
        status: '',
        type: '',
    });
    const [orderItemData, setOrderItemData] = useState({
        productId: '',
        price: 0,
    });

    const [orderCounts, setOrderCounts] = useState({  
        EDIT: 0,  
        PAID: 0,  
        HOLD: 0,  
        VOID: 0,
    });
    const orderListRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const OrderAmountbuttonRef = useRef<HTMLButtonElement | null>(null);
    const loyaltyApplyConfirmButtonRef = useRef<HTMLDivElement | null>(null);

    const [orderItemInventoryData, setOrderItemInventoryData] = useState<OrderItemInventory>({});

    console.log('orderItemInventoryData', orderItemInventoryData);

    // Atom
    const [activeSidebarItem, setActiveSideBarItem] = useAtom(ActiveSidebarItemAtom);
    const [orderListUpdate, setOrderListUpdate] = useAtom(orderListUpdated);
    const [customerIdStore, setCustomerIdStore] = useAtom(customerIdAtom);

    // const [orderStatus, setOrderStatus] = useState('');
    const [currentDrawer] = useAtom(currentDrawerAtom);
    const [changeDue, setChangeDue] = useState(0);
    const [costSum, setCostSum] = useState(0);
    const [orderDate, setOrderDate] = useState<any>();
    const [orderType, setOrderType] = useState('');
    const [originalOrderId, setOriginalOrderId] = useState(0); // original orderid for order update
    const [orderid, setOrderId] = useState(0); // orderid for useOrderQuery
    const [restock, setRestock] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [isTooltipVisible, setTooltipVisible] = useState(-1);
    const [orderItemNum, setOrderItemNum] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [itemNumSetModal, setItemNumSetModal] = useState(false);
    const [isManualDiscount, setIsManualDiscount] = useState(false);

    const [userPanelShow, setUserPanelShow] = useState(false);
    const [discountModalShow, setDiscountModalShow] = useState(false);
    const [subDiscountModalShow, setSubDiscountModalShow] = useState(false);
    const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
    const [calculationType, setCalculationType] = useState<CalculationType>('percent');
    const [percentage, setPercentage] = useState<string>('10');
    const [returnOrderAmount, setReturnOrderAmount] = useState(0);
    const currentTotal = 60.0;
    const contentRef = useRef<HTMLDivElement>(null);
    const addDiscountConfirmBtn = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const userCaptionRef = useRef<HTMLDivElement>(null);
    const ipadProductListRef = useRef<HTMLDivElement>(null);

    const [discountMethod, setDiscountMethod] = useState('ByPercent');
    const [discountName, setDiscountName] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    const [categoryId, setCategoryId] = useState('all');
    const [currentCategory, setCurrentCategory] = useState('');
    const [customOptions, setCustomOptions] = useState<any>([]);

    // for Loyalty
    const [loyaltyName, setLoyaltyName] = useState('');
    const [loyaltyType, setLoyaltyType] = useState<LoyaltyType>('MANUAL'); 
    const [pointWorth, setPointWorth] = useState(0);
    const [newOrderTotal, setNewOrderTotal] = useState(0);
    const [pointsToSpend, setPointsToSpend] = useState(0);
    const [isLoyaltyError, setIsLoyaltyError] = useState(false);
    const [returnOrderItemPackageLabel, setReturnOrderItemPackageLabel] = useState('');
    
    // const reactToPrintFn = useReactToPrint({ contentRef });

    // Fetch data
    const orderQueryResult = useOrderWithTaxSumQuery({ id: orderid });
    const orderData = orderQueryResult.data?.orderWithTaxSum?.order;
    const customerDataFromOrder = orderQueryResult.data?.orderWithTaxSum?.order?.customer;
    const OrderLimitPurchaseData = orderQueryResult.data?.orderWithTaxSum?.purchaseLimit;
    const tax = orderQueryResult.data?.orderWithTaxSum?.tax || 0;
    const orderItemsList = orderData?.OrderItem;
    console.log('orderItemsList', orderItemsList);
    const originalOrderData = useOrderForReturnQuery({ id: originalOrderId });
    const originalOrderItems = originalOrderData.data?.orderForReturn?.OrderItem;
    const dispensaryDataById = useDispensaryQuery({ id: dispensaryId });
    const dispensaryData = dispensaryDataById.data?.dispensary;
    const allCustomersByDispensaryId = useAllCustomersByDispensaryIdAndNameAndLicenseSearchQuery({ dispensaryId: dispensaryId, searchQuery: customerSearchQuery });
    // Infinite query for inventory data
    const {
        data: infiniteInventoryData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isInventoryLoading,
        error: inventoryError,
    } = useInfiniteQuery({
        queryKey: ['inventoryData', term, dispensaryId, categoryId],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "" , {
                method: 'POST',
                ...{ headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cookies.get('token') } },
                body: JSON.stringify({
                    query: `
                        query GetProductAndPackagesByNameSearch($searchQuery: String!, $dispensaryId: String!, $itemCategoryId: String!, $pageNumber: Int!, $onePageRecords: Int!) {
                            getProductAndPackagesByNameSearch(searchQuery: $searchQuery, dispensaryId: $dispensaryId, itemCategoryId: $itemCategoryId, pageNumber: $pageNumber, onePageRecords: $onePageRecords) {
                                id
                                posQty
                                packageLabel
                                cost
                                productId
                                product {
                                    name
                                    price
                                    sku
                                    productUnitOfMeasure
                                    unitOfUnitWeight
                                    unitOfNetWeight
                                    unitWeight
                                    netWeight
                                    isApplyUnitWeight
                                    itemCategory {
                                        name
                                        color
                                    }
                                }
                                package {
                                    packageId
                                    packageStatus
                                    UnitOfMeasureName
                                }
                            }
                        }
                    `,
                    variables: {
                        searchQuery: term,
                        dispensaryId: dispensaryId,
                        itemCategoryId: categoryId,
                        pageNumber: pageParam,
                        onePageRecords: 20,
                    },
                }),
            });
            const result = await response.json();
            return result.data.getProductAndPackagesByNameSearch;
        },
        getNextPageParam: (lastPage: any, allPages: any) => {
            // If the last page has fewer items than requested (20), we've reached the end
            // This is a workaround since the current API doesn't provide hasNextPage
            const hasMoreData = lastPage && lastPage.length >= 20;
            return hasMoreData ? allPages.length + 1 : undefined;
        },
        enabled: !!dispensaryId,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const customerData = allCustomersByDispensaryId.data?.allCustomersByDispensaryIdAndNameAndLicenseSearch;
    // console.log("customerData", customerData);

    const allLoyaltyDataByDispensaryId = useAllLoyaltiesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const loyaltyData = allLoyaltyDataByDispensaryId.data?.allLoyaltiesByDispensaryId;

    const allOrdersByDrawerId = useAllOrdersByDrawerIdQuery({ drawerId: currentDrawer?.id });
    const ordersData = allOrdersByDrawerId.data?.allOrdersByDrawerId;

    const editOrdersByDrawerId = useGetEditOrderByDrawerIdQuery({ drawerId: currentDrawer?.id });
    const editOrdersData = editOrdersByDrawerId?.data?.getEditOrderByDrawerId;

    const allDiscountsByDispensaryId = useAllDiscountsByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const discountData = allDiscountsByDispensaryId.data?.allDiscountsByDispensaryId;

    const purchaseLimitRowData = useGetPurchaseLimitByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const purchaseLimitData = purchaseLimitRowData.data?.getPurchaseLimitByDispensaryId;

    const allItemCategoriesByDispensaryId = useAllItemCategoriesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const itemCategories = allItemCategoriesByDispensaryId.data?.allItemCategoriesByDispensaryId;

    // Mutations
    const createOrderMutation = useCreateOrderMutation();
    const createOrderItemMutation = useCreateOrderItemMutation();
    const updateCustomerByOrderIdMudation = useUpdateCustomerByOrderIdMutation();
    const deleteOrderItemMutation = useDeleteOrderItemMutation();
    const deleteOrderItemsByOrderIdMutation = useDeleteOrderItemsByOrderIdMutation();
    const orderUpdateHoldMutation = useHoldOrderMutation();
    const createPaymentMutation = useCompleteOrderMutation();
    const orderReturnMutation = useUpdateOrderToReturnMutation();
    const orderReStockMutation = useSetRestockForOrderItemMutation();
    const createOrderItemForReturnMutation = useCreateOrderItemForReturnMutation();
    const ReturnOrderMutation = useReturnOrderMutation();
    const orderUpdateUnHoldMutation = useUnHoldOrderMutation();
    const setDiscountOrderMutation = useSetDiscountForOrderMutation();
    const cancelDiscountMutation = useCancelDiscountForOrderMutation();
    const cancelOrderMutation = useCancelOrderMutation();
    const setLoyaltyMutation = useSetLoyaltyForOrderMutation();
    const cancelLoyaltyMutation = useCancelLoyaltyForOrderMutation();
    const updateTaxHistoryForOrderMutation = useUpdateTaxHistoryForOrderMutation();

    const userOrderRowData = useAllOrderNumbersByDispensaryIdAndCustomerIdWithPagesQuery({
        dispensaryId: dispensaryId,
        customerId: orderData?.customer?.id || '',
        pageNumber: orderHistoryPage,
        onePageRecords: 5,
    });
    const userOrderData = userOrderRowData.data?.allOrderNumbersByDispensaryIdAndCustomerIdWithPages?.orderHistory;
    const userOrderDataTotal = userOrderRowData.data?.allOrderNumbersByDispensaryIdAndCustomerIdWithPages?.totalCount || 0;
    // Flatten the infinite query data
    console.log("infiniteInventoryData", infiniteInventoryData)
    const inventoryData = infiniteInventoryData?.pages?.flatMap((page: any) => page || []) ?? [];

    const [currentUser, setCurrentUser] = useState<RowDataType>({
        id: '',
        name: '',
        MFType: 'MALE',
        birthday: '',
        email: '',
        phone: '',
        isActive: false,
        driverLicense: '',
        driverLicenseExpirationDate: '',
        isMedical: true,
        isTaxExempt: false,
        loyaltyPoints: 0,
        status: 'MEDICALMEMBER',
        medicalLicenseExpirationDate: '',
        medicalLicense: '',
        createdAt: '',
        updatedAt: '',
    });

    useEffect(() => {
        let categoryOption: any[] = [];
        itemCategories?.map((item) => {
            categoryOption.push({ value: item?.id, label: item?.name });
        });
        setCustomOptions(categoryOption);
    }, [itemCategories]);

    // console.log("inventoryData", inventoryData);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        // Create separate observers for desktop and iPad modes
        const desktopObserver = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && hasNextPage && !isFetchingNextPage && !isInventoryLoading) {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        console.log('Desktop: Fetching next page...');
                        fetchNextPage();
                    }, 100);
                }
            },
            { 
                threshold: 0.1,
                rootMargin: '100px'
            }
        );

        // iPad observer with different configuration for PerfectScrollbar
        const ipadObserver = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                console.log('iPad observer triggered:', {
                    isIntersecting: target.isIntersecting,
                    hasNextPage,
                    isFetchingNextPage,
                    isInventoryLoading
                });
                if (target.isIntersecting && hasNextPage && !isFetchingNextPage && !isInventoryLoading) {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        console.log('iPad: Fetching next page...');
                        fetchNextPage();
                    }, 100);
                }
            },
            { 
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        // Observe desktop ref
        if (loadMoreRef.current) {
            desktopObserver.observe(loadMoreRef.current);
        }

        // Observe iPad ref
        if (loadMoreRefIpad.current) {
            console.log('iPad ref found, observing...');
            ipadObserver.observe(loadMoreRefIpad.current);
        } else {
            console.log('iPad ref not found');
        }

        return () => {
            desktopObserver.disconnect();
            ipadObserver.disconnect();
            clearTimeout(timeoutId);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, isInventoryLoading]);

    // Re-observe iPad ref when iPad content is actually rendered
    useEffect(() => {
        if (isIpadMode && isShowingIpadProduct && loadMoreRefIpad.current) {
            console.log('iPad content rendered, setting up observer...');
            const ipadObserver = new IntersectionObserver(
                (entries) => {
                    const target = entries[0];
                    console.log('iPad observer triggered:', {
                        isIntersecting: target.isIntersecting,
                        hasNextPage,
                        isFetchingNextPage,
                        isInventoryLoading
                    });
                    if (target.isIntersecting && hasNextPage && !isFetchingNextPage && !isInventoryLoading) {
                        console.log('iPad: Fetching next page...');
                        fetchNextPage();
                    }
                },
                { 
                    threshold: 0.1,
                    rootMargin: '50px'
                }
            );
            
            ipadObserver.observe(loadMoreRefIpad.current);
            
            return () => {
                ipadObserver.disconnect();
            };
        }
    }, [isIpadMode, isShowingIpadProduct, hasNextPage, isFetchingNextPage, fetchNextPage, isInventoryLoading]);

    // Alternative scroll-based approach for iPad mode
    useEffect(() => {
        if (!isIpadMode || !isShowingIpadProduct) return;

        const handleScroll = () => {
            const scrollContainer = document.querySelector('.ps__rail-y');
            if (scrollContainer) {
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight;
                const clientHeight = scrollContainer.clientHeight;
                
                console.log('iPad scroll:', { scrollTop, scrollHeight, clientHeight });
                
                // Check if scrolled to bottom (with some margin)
                if (scrollTop + clientHeight >= scrollHeight - 100) {
                    if (hasNextPage && !isFetchingNextPage && !isInventoryLoading) {
                        console.log('iPad scroll: Fetching next page...');
                        fetchNextPage();
                    }
                }
            }
        };

        // Add scroll listener to PerfectScrollbar container
        const scrollContainer = document.querySelector('.ps__rail-y');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => {
                scrollContainer.removeEventListener('scroll', handleScroll);
            };
        }
    }, [isIpadMode, isShowingIpadProduct, hasNextPage, isFetchingNextPage, fetchNextPage, isInventoryLoading]);

    // let inventoryData: InventoryData = RowData.map(item => {
    //     if (item === null) {
    //         return null;
    //     }
    //     return {
    //         id: item.id,
    //         itemName: item.name,
    //         itemProductCategoryName: item.itemCategory.name,
    //         Quantity: 0, // populate with real data
    //         UnitOfMeasureAbbreviation: "unit", // populate with real data
    //     };
    // })

    useEffect(() => {
        checkIsCustomerExpired();
    }, [customerDataFromOrder]);

    const checkIsCustomerExpired = () => {
        if (customerDataFromOrder?.medicalLicenseExpirationDate) {
            // Split the date string into month, day, and year
            const [month, day, year] = customerDataFromOrder.medicalLicenseExpirationDate.split('/');
            // Create date object (month is 0-based in JavaScript Date)
            const expirationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const today = new Date();
            // Reset time part to compare only dates
            today.setHours(0, 0, 0, 0);
            expirationDate.setHours(0, 0, 0, 0);
            
            // Set isCustomerExpired based on the comparison
            setIsCustomerExpired(expirationDate < today);
        } else {
            // If no expiration date, set to false
            setIsCustomerExpired(false);
        }
    };

    const [searchedIventoryData, setSearchedInventoryData] = useState<any>(inventoryData);

    //for add customer modal
    const [modalShow, setModalShow] = useState(false);
    const [modalMode, setModalMode] = useState('new');
    
    const handleKeyDown = (event: any) => {
        if (event.key == 'Enter' && subDiscountModalShow) {
            if (discountAmount > 0 && addDiscountConfirmBtn.current) {
                addDiscountConfirmBtn.current.click();
            }
        }
        if (event.key === 'Enter' && OrderAmountbuttonRef.current) {
            OrderAmountbuttonRef?.current.click();
        }
    };

    const reactToPrintFn = useReactToPrint({
        contentRef: contentRef,
        // Optional: You can also specify additional options like page style
        pageStyle: 'print',
    });
    
    const handleUpdateCategory = (id: any) => {
        setCategoryId(id);
    };

    const handleLoyaltyApplyConfirm = () => {
        if (newOrderTotal > 0 && newOrderTotal < grandTotal && pointsToSpend > 0 && pointsToSpend < (orderData?.customer?.loyaltyPoints || 0)) {
            setShowLoyaltyModal(false);
            setDiscountModalShow(false);
            handleSetLoyalty();
        }
    };

    // Update customer from customer Queue Sidebar
    useEffect(() => {
        handleUpdateCustomer(customerIdStore);
    }, [customerIdStore]);
    
    // useEffect(() => {
    //     allOrdersByDrawerId.refetch();
    // },[orderListUpdate])
    // add eventListener to loayltyApplyConfirmButon
    useEffect(() => {
        const button = loyaltyApplyConfirmButtonRef.current;  

        const handleKeyPress = (e: any) => {
            if (e.key === 'Enter') {  
                handleLoyaltyApplyConfirm();  
            }  
        };    
        if (button) { 
            button.addEventListener('keydown', handleKeyPress);  
        }
        return () => {  
            if (button) {  
                button.removeEventListener('keydown', handleKeyPress);  
            }  
        };
    }, [loyaltyApplyConfirmButtonRef.current]);
    // Calculate the order number for each status
    useEffect(() => {  
        if (ordersData) {  
            const counts = ordersData.reduce(
                (acc, order) => {
                if (order && order?.status in acc) {  
                    acc[order.status]++;  
                }  
                return acc;  
                },
                { EDIT: 0, PAID: 0, HOLD: 0, VOID: 0 }
            );

            setOrderCounts(counts);  
        }  
    }, [ordersData]);

    console.log('editOrdersData', editOrdersData);
    useEffect(() => {
        setOrderItemInventoryData({});
        editOrdersData?.forEach((order: any) => {  
            if (order?.status !== 'EDIT') return;  

            setOrderItemInventoryData((prevData: OrderItemInventoryData) => {  
                console.log('Order ------------->', order);
                const orderId = order?.id.toString();  
                const orderItemList = order?.OrderItem;  

                const orderItemInventor: OrderItemInventory = {};  
                orderItemList?.forEach((item: any) => {  
                    const existingQty = orderItemInventor[item?.packageLabel]?.currentQty || 0;
                    orderItemInventor[item?.packageLabel] = { currentQty: existingQty + item?.quantity };  
                });  

                return {  
                    ...prevData,  
                    [orderId]: orderItemInventor,
                };  
            });  
        });
    }, [editOrdersData]);

    // useEffect(() => {
        
    //     setOrderItemInventoryData((prev) => {
    //         const { [orderNumber.toString()]: removedOrder, ...remainingOrders } = prev;
    //         return remainingOrders;
    //     });
    //     if (orderItemsList) {
    //         orderItemsList.map((item: any) => {
    //             if (item?.packageLabel) {
    //                 setOrderItemInventoryData((prevData: any) => {
    //                     const orderId = orderNumber.toString();
    //                     const existingOrderData = prevData[orderId] || {};
    //                     const existingPackageData = existingOrderData[item.packageLabel] || { originalQty: 0, currentQty: 0 };

    //                     return {
    //                         ...prevData,
    //                         [orderId]: {
    //                             ...existingOrderData,
    //                             [item.packageLabel]: {
    //                                 currentQty: existingPackageData.currentQty ? existingPackageData.currentQty + item.quantity : item.quantity
    //                             }
    //                         }
    //                     };
    //                 });
    //             }
    //         });
    //     }
    // }, [orderItemsList]);
    
    useEffect(() => {
        // Add event listener for keydown events
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [addDiscountConfirmBtn.current, OrderAmountbuttonRef.current, subDiscountModalShow]);

    useEffect(() => {
        setOrderNumber(0);
        setOrderId(0);
    }, [currentDrawer]);

    // when create order from customer queue
    useEffect(() => {
        const orderNum = Number(searchParams.get('orderId'));
        setOrderId(orderNum);
        setOrderNumber(orderNum);
    }, [searchParams]);

    useEffect(() => {
        let sum = 0;
        orderItemsList?.map((item) => {
            if (item?.product?.price) {
                const price = new Decimal((item.product.price || 0).toFixed(4));
                const sumDecimal = new Decimal(sum.toFixed(4));
                sum = setFourDecimals(sumDecimal.plus(price).toNumber());
            }
        });

        const totalQuantity = orderItemsList?.reduce((acc, current) => acc + (current?.quantity || 0), 0);

        setTotalItems(totalQuantity || 0);
        setCostSum(sum);
        setOrderDate(orderData?.orderDate);
    }, [orderItemsList]);

    useEffect(() => {
        setBirthdayShow(false);
        setIsManualDiscount(false);
        setNewOrderTotal(0);
        setPointsToSpend(0);  
        setAgeVerified(Moment(orderData?.customer?.birthday).format('YYYY-MM-DD'));
        if (orderData?.orderType == 'RETURN' && orderData.status == 'EDIT' && currentSlide == 2) {
            swiperRef.current.swiper.slideTo(2);
        } else {
            if (orderData?.status == 'PAID' && swiperRef.current) {
                swiperRef.current.swiper.slideTo(3);
            } else swiperRef.current.swiper.slideTo(0);
        }
        setIsCashed(false);
        setPayAmount(0);

        if (orderData?.orderType == 'RETURN' && orderData.status != 'PAID') setOriginalOrderId(orderData?.originalOrder || 0);

        // confirm if customer is birthday today
        if (isTodayBirthday()) setBirthdayShow(true);

        // is there manual discount in discount history
        const discountHistory = orderData?.DiscountHistory;
        discountHistory?.map((item) => {
            if (item?.discountMethod == 'BYAMOUNT' || item?.discountMethod == 'BYPERCENT' || item?.discountMethod == 'TOAMOUNT') setIsManualDiscount(true);
        });
    }, [orderData]);

    useEffect(() => {
        if (orderData?.status == 'PAID' && currentSlide >= 2) swiperRef.current.swiper.slideTo(3);
    }, [currentSlide]);

    function isTodayBirthday() {
        const birthday = new Date(orderData?.customer?.birthday || '');
        const today = new Date();

        return today.getDate() === birthday.getDate() && today.getMonth() === birthday.getMonth();
    }

    // Inside the Search Component...
    const handleSearch = useDebouncedCallback((term) => {
        setTerm(term);
    }, 500);

    const handleCustomerSearch = useDebouncedCallback((term) => {
        setCustomerSearchQuery(term);
    }, 500);

    // For outside of orderlist click
    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    });
    
    const calculateNewTotal = () => {
        const percentValue = parseFloat(percentage);
        if (isNaN(percentValue)) return currentTotal;
        const discount = (currentTotal * percentValue) / 100;
        return currentTotal - discount;
    };

    // handle click outside of orderList
    const handleOutsideClick = (event: MouseEvent) => {
        if (orderListRef.current && !orderListRef.current.contains(event.target as Node)) {
            setShowOrderList(false); // Close the component or perform your action
        }
        if (ipadProductListRef.current && !ipadProductListRef.current.contains(event.target as Node)) {
            setIsShowingIpadProduct(false);
        }
    };

    const handleCancelOrder = async () => {
        Swal.fire({
            icon: 'warning',
            title: 'Cancel Order?',
            text: 'Are you going to really Cancel?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await cancelOrderMutation.mutate(
                    {
                        input: {
                            id: orderid,
                        },
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            successAlert('Order cancelled Successfully!');
                            setOrderNumber(0);
                            allOrdersByDrawerId.refetch();
                            orderQueryResult.refetch();
                            editOrdersByDrawerId.refetch();
                        },
                    }
                );
            }
        });
    };

    const handleCancelDiscount = async () => {
        Swal.fire({
            icon: 'warning',
            title: 'Cancel Discount?',
            text: 'Are you going to really Cancel?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await cancelDiscountMutation.mutate(
                    {
                        orderId: orderid,
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        async onSuccess(data) {
                            if (!data) return;
                            successAlert('Discount Cancelled Successfully!');
                            await updateTaxHistoryForOrderMutation.mutate(
                                {
                                    orderId: orderNumber,
                                },
                                {
                                    onError(error: any) {
                                        warnAlert('Tax apply failed');
                                    },
        
                                    onSuccess(data: any) {
                                        // successAlert("")
                                        orderQueryResult.refetch();
                                    },
                                    }
                            );
                        },
                    }
                );
            }
        });
    };

    const handleCacelLoyalty = async () => {
        Swal.fire({
            icon: 'warning',
            title: 'Cancel Loyalty?',
            text: 'Are you going to really Cancel?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await cancelLoyaltyMutation.mutate(
                    {
                        orderId: orderid,
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        async onSuccess(data) {
                            if (!data) return;
                            successAlert('Loyalty Cancelled Successfully!');
                            await updateTaxHistoryForOrderMutation.mutate(
                                {
                                    orderId: orderNumber,
                                },
                                {
                                    onError() {
                                        warnAlert('Tax apply failed');
                                    },
        
                                    onSuccess() {
                                        // successAlert("")
                                        orderQueryResult.refetch();
                                    },
                                    }
                            );
                        },
                    }
                );
            }
        });
    };

    const CalcReturnOrderAmount = () => {
        let amount = new Decimal(0);
        if (Array.isArray(orderItemsList)) {
            orderItemsList.map((item) => {
                const price = new Decimal(item?.product?.price || 0);
                const quantity = new Decimal(item?.quantity || 0);
                amount = amount.plus(price.times(quantity));
            });
        }
        return setFourDecimals(amount.toNumber());
    };

    // const getCustomerObject = (id: any) => {
    //     let selectedCustomer: any;
    //     customerOptions.forEach((element: any) => {
    //         element.value === id ? (selectedCustomer = element) : null;
    //     });
    //     return selectedCustomer;
    // };

    // let customerOptions: any = [];

    // if (customerData && Array.isArray(customerData)) {
    //     // customerOptions.push({ value: '', label: 'Select customer' });
    //     customerData.map((category: any) => {
    //         customerOptions.push({ value: category.id, label: category.name + ' (' + category.medicalLicense + ')', name: category.name, isMedical: category.isMedical });
    //         return null; // Make sure to return a value in the map function
    //     });
    // } else {
    // }

    useEffect(() => {
        let customerOptionsTemp: any[] = [];
        if (customerData && Array.isArray(customerData)) {
            customerData.map((category: any) => {
                customerOptionsTemp.push({ value: category.id, label: category.name + ' (' + category.medicalLicense + ')', name: category.name, isMedical: category.isMedical });
            });
        }
        setCustomerOptions(customerOptionsTemp);
    }, [customerData]);

    const DateConverter = (timestamp: number) => {
        const date = new Date(timestamp);

        // Format the date and time
        const options: any = {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        };

        const formattedDate = date.toLocaleString('en-US', options).replace(',', ' -');
        return formattedDate;
    };

    const handleOrderUpdateHold = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Hold an Order',
            text: 'Do you want to hold this order?',
            showCancelButton: true,
            confirmButtonText: 'Hold',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await orderUpdateHoldMutation.mutate(
                    {
                        input: {
                            id: orderNumber,
                        },
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            successAlert('Order hold success');
                            orderQueryResult.refetch();
                            allOrdersByDrawerId.refetch();
                            // setCustomerName(e.name)
                            // setCustomerIsMedical(e.isMedical)
                        },
                        onSettled() {},
                    }
                );
            }
        });
    };
    const handleOrderUpdateUnHold = () => {
        Swal.fire({
            icon: 'warning',
            title: 'UnHold an Order',
            text: 'Do you want to unhold this order?',
            showCancelButton: true,
            confirmButtonText: 'UnHold',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await orderUpdateUnHoldMutation.mutate(
                    {
                        input: {
                            id: orderNumber,
                        },
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            orderQueryResult.refetch();
                            allOrdersByDrawerId.refetch();

                            successAlert('Order Unhold success');
                            // setCustomerName(e.name)
                            // setCustomerIsMedical(e.isMedical)
                        },
                        onSettled() {},
                    }
                );
            }
        });
    };
    const handleOrderReturnComplete = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Return Order',
            text: 'Do you want to return this order?',
            showCancelButton: true,
            confirmButtonText: 'Return',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                const returnOrderAmount = await CalcReturnOrderAmount();
                await ReturnOrderMutation.mutate(
                    {
                        input: {
                            amount: returnOrderAmount,
                            changeDue: 0,
                            cost: 0,
                            discount: 0,
                            dispensaryId: dispensaryId,
                            customerId: orderData?.customer?.id || '',
                            method: 'CASH',
                            orderId: orderNumber,
                            payDate: orderDate,
                            returnReason: returnReason,
                        },
                    },
                    {
                        onError(error) {
                            warnAlert('Order return failed!');
                        },
                        onSuccess(data) {
                            if (!data) return;
                            orderQueryResult.refetch();
                            allOrdersByDrawerId.refetch();
                            swiperRef.current.swiper.slideNext();
                            // Refetch inventory data
                            // Note: useInfiniteQuery doesn't have a direct refetch method
                            // The query will automatically refetch when dependencies change
                            // successAlert('Order Return success');
                            // setCustomerName(e.name)
                            // setCustomerIsMedical(e.isMedical)
                        },
                        onSettled() {},
                    }
                );
            }
        });
    };
    const deleteAlert = async (id: string, packageLabel: string, quantity: number) => {
        handleDeleteOrderItem(id, packageLabel, quantity);
    };
    const deleteAllAlert = async (id: number) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Clear',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then((result) => {
            if (result.value) {
                handleDeleteOrderItemsByOrderId(id);
            } else {
            }
        });
    };
    const completeOrderAlert = async () => {
        Swal.fire({
            icon: 'success',
            title: 'Complete Order?',
            text: 'Are you going to really complete?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then((result) => {
            if (result.value) {
                handleCompleteOrder();
                swiperRef.current.swiper.slideNext();
            } else {
            }
        });
    };
    const handleOrderReturn = async (id: any) => {
        if (Array.isArray(orderItemsList) && orderItemsList.length > 0) {
            warnAlert(
                'To be a Return type order\
                please remove all products in the order #' +
                    id +
                    '. Or you can create a new order'
            );
            return;
        }

        Swal.fire({
            icon: 'warning',
            title: 'Return Order?',
            text: 'Are you going to really return?',
            showCancelButton: true,
            confirmButtonText: 'Sure',
            padding: '2em',
            customClass: 'sweet-alerts sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then(async (result) => {
            if (result.value) {
                await orderReturnMutation.mutate(
                    {
                        input: {
                            orderId: orderNumber,
                            originalOrderId: id,
                        },
                    },
                    {
                        onError(error) {
                            warnAlert(error.message);
                        },
                        onSuccess(data) {
                            if (!data) return;
                            allOrdersByDrawerId.refetch();
                            orderQueryResult.refetch();
                            // refetchOrder();
                            // queryClient.invalidateQueries(['Order', { id: originalOrderId }]);
                            // orderQueryResult.refetch()
                            setOrderType('return');
                            setUserPanelShow(false);
                            // successAlert('Order Return success');
                        },
                        onSettled() {},
                    }
                );
            } else {
            }
        });
    };

    const handleCreateOrder = async () => {
        setIsNewOrderButtonDisabled(true);

        const orderDate = Moment(currentDay).format('YYYY-MM-DD');
        await createOrderMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    userId: userId,
                    status: 'EDIT',
                    orderDate: orderDate,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    setOrderNumber(data.createOrder?.id || 0);
                    setOrderId(data.createOrder?.id || 0);
                    allOrdersByDrawerId.refetch();
                    // Refetch inventory data
                    // Note: useInfiniteQuery doesn't have a direct refetch method
                    // The query will automatically refetch when dependencies change
                    setIsCompleteOrder(false);
                },
                onSettled() {
                    setIsNewOrderButtonDisabled(false);
                },
            }
        );
    };
    const handleCreateOrderForReturn = async (productId: any, quantity: any) => {
        setIsNewOrderButtonDisabled(true);

        await createOrderItemForReturnMutation.mutate(
            {
                input: {
                    packageLabel: returnOrderItemPackageLabel,
                    orderId: orderNumber,
                    productId: productId,
                    quantity: setFourDecimals(quantity),
                },  
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    orderQueryResult.refetch();
                    allOrdersByDrawerId.refetch();
                },
                onSettled() {
                    setIsNewOrderButtonDisabled(false);
                },
            }
        );
    };
    const handleCompleteOrder = async () => {
        // const orderDate = Moment(currentDay).format('YYYY-MM-DD');
        const changeDue = grandTotal
            ? setFourDecimals(
            new Decimal((payAmount || 0).toFixed(4))
                .plus(new Decimal((otherAmount || 0).toFixed(4)))
                .minus(new Decimal((grandTotal || 0).toFixed(4)))
                .toNumber()
              )
            : 0;

        setChangeDue(changeDue);
        await createPaymentMutation.mutate(
            {
                input: {
                    amount: setFourDecimals(payAmount),
                    otherAmount: setFourDecimals(otherAmount),
                    customerId: orderData?.customer?.id || '',
                    method: 'CASH',
                    changeDue: setFourDecimals(changeDue),
                    orderId: orderNumber || 0,
                    discount: setFourDecimals(discount || 0),
                    cost: 0,
                    payDate: orderDate,
                    dispensaryId: dispensaryId,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    if (data.completeOrder?.pos) {
                        Store.addNotification({
                            title: `Order #${orderNumber}`,
                            message: `Successfully Complete!`,
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
                    } else {
                        Store.addNotification({
                            title: `Order #${orderNumber}`,
                            message: `Order Failed!`,
                            type: 'warning',
                            insert: 'bottom',
                            container: 'bottom-left',
                            animationIn: ['animate__animated', 'animate__fadeIn'],
                            animationOut: ['animate__animated', 'animate__fadeOut'],
                            dismiss: {
                              duration: 4000,
                                onScreen: true,
                            },
                          });
                    }
                    setTimeout(() => {
                    if (data.completeOrder?.metrc == 'success') {
                        // console.log("data.completeOrder?.metrc", data.completeOrder?.metrc);
                        Store.addNotification({
                                title: 'Metrc',
                            message: `Order #${orderNumber} Reported!`,
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
                    } else if (data.completeOrder?.metrc == 'failed') {
                        Store.addNotification({
                                title: 'Metrc',
                            message: `Order #${orderNumber} Report Failed!`,
                                type: 'warning',
                                insert: 'bottom',
                                container: 'bottom-left',
                                animationIn: ['animate__animated', 'animate__fadeIn'],
                                animationOut: ['animate__animated', 'animate__fadeOut'],
                            dismiss: {
                              duration: 4000,
                                    onScreen: true,
                                },
                          });
                        }
                    }, 1000);
                    exitLabelPrintButtonRef.current?.click();
                    allOrdersByDrawerId.refetch();
                    orderQueryResult.refetch();
                    // Refetch inventory data
                    // Note: useInfiniteQuery doesn't have a direct refetch method
                    // The query will automatically refetch when dependencies change

                    setIsCompleteOrder(true);
                    editOrdersByDrawerId.refetch();
                    // setOrderItemInventoryData((prev) => {
                    //     const { [orderNumber.toString()]: removedOrder, ...remainingOrders } = prev;
                    //     return remainingOrders;
                    // });
                    // successAlert('Order complete success');
                },
                onSettled() {
                    setIsNewOrderButtonDisabled(false);
                },
            }
        );
    };
    const handleOrderReStock = async (id: any, flag: any) => {
        // const orderDate = Moment(currentDay).format('YYYY-MM-DD');
        // setChangeDue(subtotal ? payAmount - subtotal : 0);
        await orderReStockMutation.mutate(
            {
                input: {
                    id: id,
                    trueFalse: flag,
                },
            },
            {
                onError(error) {
                    warnAlert('Product restock failed!');
                },
                onSuccess(data) {
                    if (!data) return;
                    // allOrdersByDrawerId.refetch();
                    orderQueryResult.refetch();
                    // successAlert('Product restock success!');
                },
                onSettled() {
                    setIsNewOrderButtonDisabled(false);
                },
            }
        );
    };

    const handleUpdateCustomer = async (customerID: any) => {
        if (orderNumber === 0) {
            warnAlert('Select an order');
            return;
        }
        await updateCustomerByOrderIdMudation.mutate(
            {
                input: {
                    orderId: orderNumber,
                    customerId: customerID,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    allOrdersByDrawerId.refetch();
                    orderQueryResult.refetch();
                    // setCustomerName(e.name)
                    // setCustomerIsMedical(e.isMedical)
                },
                onSettled() {},
            }
        );
    };

    const handleSetDiscount = async () => {
        await setDiscountOrderMutation.mutate(
            {
                input: {
                    discountMethod: discountMethod == 'ByAmount' ? 'BYAMOUNT' : discountMethod == 'ByPercent' ? 'BYPERCENT' : 'TOAMOUNT',
                    discountName: discountName,
                    dispensaryId: dispensaryId,
                    orderId: orderNumber,
                    value: discountAmount,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                async onSuccess(data) {
                    if (!data) return;
              
                    await updateTaxHistoryForOrderMutation.mutate(
                        {
                            orderId: orderNumber,
                        },
                        {
                            onError() {
                                warnAlert('Tax apply failed');
                            },

                            onSuccess() {
                                // successAlert("")
                                allOrdersByDrawerId.refetch();
                                orderQueryResult.refetch();
                            },
                            }
                    );
                    // setCustomerName(e.name)
                    // setCustomerIsMedical(e.isMedical)
                },
                onSettled() {},
            }
        );
    };

    const handleSetLoyalty = async () => {
        await setLoyaltyMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    txType: 'spend',
                    loyaltyName: loyaltyName,
                    loyaltyType: loyaltyType,
                    loyaltyWorth: pointWorth,
                    orderId: orderid,
                    value: pointsToSpend,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                async onSuccess(data) {
                    if (!data) return;
                    
                    await updateTaxHistoryForOrderMutation.mutate(
                        {
                            orderId: orderNumber,
                        },
                        {
                            onError() {
                                warnAlert('Tax apply failed');
                            },

                            onSuccess() {
                                // successAlert("")
                                allOrdersByDrawerId.refetch();
                                orderQueryResult.refetch();
                            },
                            }
                    );
                    // setCustomerName(e.name)
                    // setCustomerIsMedical(e.isMedical)
                },
                onSettled() {},
            }
        );
    };
    const validCreateOrderItem = (packageLabel: string, originalQty: number, orderItemNum: number) => {
        console.log('orderItemNum', orderItemNum);
        if (orderNumber === 0) {
            setIsNewOrderItemButtonDisabled(false);
            warnAlert('Choose an order number');
            return false;
        }

        if (orderData?.status != 'EDIT') {
            setIsNewOrderItemButtonDisabled(false);
            warnAlert('Not allowed for HOLD order');
            return false;
        }

        if (orderData?.customer === null || orderData?.customer === undefined) {
            warnAlert('Select a customer');
            setIsNewOrderItemButtonDisabled(false);
            return false;
        }

        if (dispensaryData?.isCustomerAgeVerify && !isAgeVerified) {
            setIsNewOrderItemButtonDisabled(false);
            const alertMsg = 'Current customer is under' + ' ' + dispensaryData.customerAgeLimit;
            warnAlert(alertMsg);
            return false;
        }
        if (originalQty < orderItemNum) {
            warnAlert('Quantity is over the inventory');
            return false;
        }
        let orderNumbers: any[] = [];
        // Sum up currentQty across all orders for this package label
        const totalCurrentQty = Object.entries(orderItemInventoryData).reduce((sum, [orderId, orderData]) => {
            const packageData = orderData[packageLabel];
            if (packageData?.currentQty) {
                orderNumbers.push(orderId);
            }
            return sum + (packageData?.currentQty || 0);
        }, 0);

        if (totalCurrentQty + orderItemNum > originalQty) {
            setShowPackageInventoryWarning(true);
            if (orderNumbers.length > 1) {
                setPackageInventoryWarningMessage(`Order #${orderNumbers.join(', #')} are overstock orders for package ${packageLabel.slice(-10).toUpperCase()}`);
            } else {
                setPackageInventoryWarningMessage(`Order #${orderNumbers.join(', #')} is an overstock order for package ${packageLabel.slice(-10).toUpperCase()}`);
            }
            
            return false;
        }
        return true;
    };
    const handleUpdateInventoryData = async (orderNumber: number, packageLabel: string, posQty: number, orderItemNum: number) => {
        setOrderItemInventoryData((prevData) => {
            const orderId = orderNumber.toString();
            const existingOrderData = prevData[orderId] || {};
            const existingPackageData = existingOrderData[packageLabel];

            return {
                ...prevData,
                [orderId]: {
                    ...existingOrderData,
                    [packageLabel]: {
                        originalQty: posQty,
                        currentQty: existingPackageData ? existingPackageData.currentQty + orderItemNum : orderItemNum,
                    },
                },
            };
        });
    };

    const handleCreateOrderItem = async (productId: string, quantity: number, price: number, cost: number, packageLabel: string, originalQty: number) => {
        setIsNewOrderItemButtonDisabled(true);
        // if(!validCreateOrderItem()) {
        //     return false;
        // }
        await createOrderItemMutation.mutate(
            {
                input: {
                    cost: setFourDecimals(cost),
                    price: setFourDecimals(price),
                    orderId: orderNumber,
                    productId: productId,
                    quantity: setFourDecimals(quantity),
                    packageLabel: packageLabel,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                    searchInputRef.current?.focus();
                    setSearch('');
                },
                async onSuccess(data) {
                    if (!data) return;
                    
                    searchInputRef.current?.focus();
                    setSearch('');
                    // handleUpdateInventoryData(orderNumber, packageLabel, originalQty, quantity);
                    await updateTaxHistoryForOrderMutation.mutate(
                        {
                            orderId: orderNumber,
                        },
                        {
                            onError() {
                                warnAlert('Tax apply failed');
                            },

                            onSuccess() {
                                // successAlert("")
                                orderQueryResult.refetch();
                                editOrdersByDrawerId.refetch();
                            },
                            }
                    );
                },
                onSettled() {
                    setIsNewOrderItemButtonDisabled(false);
                    searchInputRef.current?.focus();
                    setSearch('');
                },
            }
        );
    };

    const handleDeleteOrderItem = async (id: string, packageLabel: string, quantity: number) => {
        setIsDeleteOrderItemButtonDisabled(true);
        await deleteOrderItemMutation.mutate(
            {
                id: id,
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                async onSuccess(data) {
                    if (!data) return;
                    await updateTaxHistoryForOrderMutation.mutate(
                        {
                            orderId: orderNumber,
                        },
                        {
                            onError() {
                                warnAlert('Tax apply failed');
                            },

                            onSuccess() {
                                // successAlert("")
                                orderQueryResult.refetch();
                                editOrdersByDrawerId.refetch();
                            },
                            }
                    );
                    // setOrderItemInventoryData((prevData: any) => {
                    //     console.log("quantity", quantity);
                    //     const { [orderNumber]: currentOrder, ...remainingOrders } = prevData;
                    //     console.log("currentOrder", currentOrder);
                    //     const currentPackageData = currentOrder ? currentOrder[packageLabel] : null;
                    //     if (currentPackageData && currentPackageData?.currentQty >= quantity) {
                    //         currentOrder[packageLabel].currentQty -= quantity;
                    //     }

                    //     return {
                    //         ...remainingOrders,
                    //         [orderNumber]: currentOrder
                    //     };
                    // });
                },
                onSettled() {
                    setIsDeleteOrderItemButtonDisabled(false);
                },
            }
        );
    };

    const handleDeleteOrderItemsByOrderId = async (id: number) => {
        await deleteOrderItemsByOrderIdMutation.mutate(
            {
                orderId: id,
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                async onSuccess(data) {
                    if (!data) return;
                    orderQueryResult.refetch();
                    editOrdersByDrawerId.refetch();

                    // setOrderItemInventoryData((prevData) => {
                    //     const orderId = id.toString();
                    //     const { [orderId]: removedOrder, ...remainingOrders } = prevData;
                    //     return remainingOrders;
                    // });
                },
                onSettled() {},
            }
        );
    };

    const setAgeVerified = (birthday: string) => {
        if (birthday === null || birthday === undefined) {
            setIsAgeVerified(false);
        }
        const agelimit = dispensaryData?.customerAgeLimit ? dispensaryData?.customerAgeLimit : 18;
        if (currentDay.getFullYear() - parseInt(birthday.split('-')[0], 10) > agelimit) setIsAgeVerified(true);
        else setIsAgeVerified(false);
    };

    const onSlideChange = () => {
        if (swiperRef.current && swiperRef.current.swiper) {
            setCurrentSlide(swiperRef.current.swiper.activeIndex);
        }
    };

    const itemColumns = [
        // {
        //     key: 'category',
        //     label: 'Category',
        //     class: 'text-left w-[30%]',
        // },
        {
            key: 'title',
            label: 'Product Name',
            class: 'text-left w-[40%]',
        },
        {
            key: 'packageLabel',
            label: 'Package',
            class: 'text-left w-[40%]',
        },
        {
            key: 'price',
            label: 'Price',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'quantity',
            label: 'Qty',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'amount',
            label: 'Amount',
            class: 'ltr:text-right rtl:text-left',
        },
    ];
    const product_columns = [
        {
            key: 'category',
            label: 'Category',
            class: 'text-left',
        },
        {
            key: 'name',
            label: 'Product Name',
        },
        {
            key: 'packageLabel',
            label: 'Package',
        },
        {
            key: 'price',
            label: 'Price',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'stock',
            label: 'Stock',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'add',
            label: 'Add',
            class: 'ltr:text-right rtl:text-left',
        },
    ];
    let multiplyResult = (a: number, b: number) => {
        const decimalA = new Decimal(a.toFixed(4));
        const decimalB = new Decimal(b.toFixed(4));
        return setFourDecimals(decimalA.times(decimalB).toNumber());
    };

    // const subTotal = orderItemsList?.reduce((acc, item) => {
    //     if (!item) return acc;
    //     const price = new Decimal((item.product.price || 1).toFixed(4));
    //     const quantity = new Decimal((item.quantity || 0).toFixed(4));
    //     const accDecimal = new Decimal(acc.toFixed(4));
    //     return setFourDecimals(accDecimal.plus(price.times(quantity)).toNumber());
    // }, 0);

    const subTotal = orderItemsList?.reduce((acc, item) => {
        if (!item) return acc;
        const accDecimal = new Decimal(acc.toFixed(4));
        return setFourDecimals(accDecimal.plus(setFourDecimals(item.amount || 0)).toNumber());
    }, 0);

    const discount = orderItemsList?.reduce((acc, item) => {
        if (!item) return acc;
        const accDecimal = acc;
        const itemDiscount = item.discountedAmount || 0;
        return setFourDecimals(accDecimal + itemDiscount);
    }, 0);

    const { loyaltySpend, loyaltySpendPoint, loyaltyEarn, loyaltyEarnedPoint } = (orderData?.LoyaltyHistory ?? []).reduce(  
        (acc, item) => {  
            const value = new Decimal((item?.value || 0).toFixed(4));
            const worth = new Decimal((item?.loyaltyWorth || 0).toFixed(4));
            const val = setFourDecimals(value.times(worth).toNumber());
            
            if (item?.txType === 'spend') {  
                const spendPoint = new Decimal(acc.loyaltySpendPoint.toFixed(4));
                const spend = new Decimal(acc.loyaltySpend.toFixed(4));
                acc.loyaltySpendPoint = setFourDecimals(spendPoint.plus(value).toNumber());
                acc.loyaltySpend = setFourDecimals(spend.plus(val).toNumber());
            } else if (item?.txType === 'earn') {  
                const earnPoint = new Decimal(acc.loyaltyEarnedPoint.toFixed(4));
                const earn = new Decimal(acc.loyaltyEarn.toFixed(4));
                acc.loyaltyEarnedPoint = setFourDecimals(earnPoint.plus(value).toNumber());
                acc.loyaltyEarn = setFourDecimals(earn.plus(val).toNumber());
            }  
            return acc;  
        },  
        { loyaltySpend: 0, loyaltySpendPoint: 0, loyaltyEarn: 0, loyaltyEarnedPoint: 0 }  
    );  

    const grandTotal = setFourDecimals(
        new Decimal((subTotal || 0).toFixed(4))
            .minus(new Decimal((discount || 0).toFixed(4)))
            .minus(new Decimal((loyaltySpend || 0).toFixed(4)))
            .toNumber()
    );

    // Function to handle clicks outside the tooltip
    const handleClickOutside = (event: any) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
            setTooltipVisible(-1); // Close the tooltip
        }
        if (userCaptionRef.current && !userCaptionRef.current.contains(event.target)) {
            setShowUserCaption(false); // Close the tooltip
        }
    };

    // Attach the click event listener to the document
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRefresh = () => {
        // Refetch inventory data
        // Note: useInfiniteQuery doesn't have a direct refetch method
        // The query will automatically refetch when dependencies change
        // For now, we can trigger a re-render by updating a state
        setSearch((prev) => prev + ' '); // This will trigger the query to refetch
        setTimeout(() => setSearch((prev) => prev.trim()), 100);
    };

    const handleAfterExitLabelPrint = () => {
        successAlert('Exit label printed successfully');
        // Add a small delay to ensure the exit label print dialog is closed
        setTimeout(() => {
            if (receiptPrintButtonRef.current && (receiptPrintButtonRef.current as any).print) {
                (receiptPrintButtonRef.current as any).print();
            }
        }, 500);
    };

    const handleAfterReceiptPrint = () => {
        // successAlert('Receipt printed successfully');
    };
    
    // Helper function to format numbers
    const formatNumber = (num: number) => {
        return Number.isInteger(num) ? num.toString() : truncateToTwoDecimals(num);
    };

    return (
        <div className="relative flex flex-col justify-between">
            <div className="relative">
                <div className={`panel p-3 mb-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
                    <div className="flex justify-between gap-4 px-4">
                        <div className="flex justify-start item-center">
                            {isIpadMode ? (
                                <button
                                    className="flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 mr-2"
                                    onClick={() => {
                                        setIsIpadMode(false);
                            // console.log("currentSlide", orderData?.status, currentSlide)
                                        if (orderData?.status == 'PAID' && currentSlide == 2) {
                                swiperRef.current.swiper.slideTo(3);
                            }
                                    }}
                                >
                                    <MdOutlinePhoneIphone className="h-5 w-6" />
                        </button>
                            ) : (
                                <button
                                    className="flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60 mr-2"
                                    onClick={() => {
                                        setIsIpadMode(true);
                                    }}
                                >
                                    <IoDesktopOutline className="h-5 w-5" />
                                </button>
                            )}
                        <div className="flex items-center">
                            <div className="h-full bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                <label className="w-7 h-4 relative cursor-pointer mb-0">
                                    <input
                                        type="checkbox"
                                        className="peer absolute w-full h-full opacity-0 z-10 focus:ring-0 focus:outline-none cursor-pointer"
                                        id="custom_switch_checkbox1"
                                        checked={isChangeDate}
                                        onChange={(event) => setIsChangeDate(event.target.checked)}
                                    />
                                    <span className="rounded-full border border-[#adb5bd] bg-white peer-checked:bg-primary peer-checked:border-primary dark:bg-dark block h-full before:absolute ltr:before:left-0.5 rtl:before:right-0.5 ltr:peer-checked:before:left-3.5 rtl:peer-checked:before:right-3.5 peer-checked:before:bg-white before:bg-[#adb5bd] dark:before:bg-white-dark before:bottom-[2px] before:w-3 before:h-3 before:rounded-full before:transition-all before:duration-300"></span>
                                </label>
                            </div>
                            <Flatpickr
                                disabled={!isChangeDate}
                                id="currentDate"
                                value={currentDay}
                                options={{
                                    dateFormat: 'Y-m-d',
                                    position: isRtl ? 'auto right' : 'auto left',
                                }}
                                className="h-full form-input flex-1 ltr:rounded-l-none rtl:rounded-r-none"
                                onChange={(date) => {
                                    setCurrentDay(date[0]);
                                    allOrdersByDrawerId.refetch();
                                }}
                            />
                            </div>
                        </div>
                        {isIpadMode ? (
                        <div className="w-[500px] flex justify-center items-center relative">
                            {/* <CustomSelect
                                options={customOptions}
                                onChange={handleUpdateCategory}
                                currentOption={currentCategory}
                                setModalShow={setModalShow}
                                showingText='All Categories'
                                disabled={false}
                                showingSearch={false}
                            /> */}
                            <div className='flex justify-start items-center w-36'>
                                <CategorySelect onChange={handleUpdateCategory} currentCategoryId={categoryId} />
                            </div>
                            <div className="relative ml-2">
                                <div className="flex">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className="peer form-input w-full bg-gray-100 placeholder:tracking-widest ltr:pl-9 ltr:pr-9 rtl:pl-9 rtl:pr-9 sm:bg-transparent ltr:sm:pr-4 rtl:sm:pl-4 rounded-r-none"
                                    placeholder="Search Product & Package..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        handleSearch(e.target.value);
                                    }}
                                    onFocus={() => setIsShowingIpadProduct(true)}
                                />
                                <button className='rounded-l-none border-white-light dark:border-[#253b5c] rounded-md px-3 py-2 text-md dark:bg-[#1b2e4b] dark:text-white-dark' onClick={() => {searchInputRef.current?.focus()}}>
                                    <CiBarcode/> 
                                </button>
                            </div>
                            <button type="button" className="absolute inset-0 h-9 w-9 appearance-none peer-focus:text-primary ltr:right-auto rtl:left-auto">
                                <IconSearch className="mx-auto" />
                            </button>
                            </div>
                                {isShowingIpadProduct ? (
                            <div ref={ipadProductListRef} className="absolute top-[43px] flex flex-col justfy-center max-h-[400px] z-[50]">
                            <PerfectScrollbar>
                                <>
                                    {inventoryData?.length > 0
                                        ? inventoryData?.map((item: any, key: any) => (
                                                      <div key={key} className="p-2 w-full mb-[1px] flex justify-between items-center dark:bg-[#141e33] bg-gray-100 rounded-md">
                                        <div>
                                            <ProductCategory name={item?.product?.itemCategory?.name} color={item?.product?.itemCategory?.color} />
                                        </div>
                                                          <div className="w-[4px] h-[1px] bg-white-dark dark:bg-dark mx-[1px]"></div>
                                        <div className="break-words">{item?.product?.name}</div>
                                                          <div className="w-[4px] h-[1px] bg-white-dark dark:bg-dark mx-[1px]"></div>
                                        <div className="break-words flex flex-col justify-start">
                                            <div className="flex justify-start items-center">
                                                {item?.packageLabel.slice(-10).toUpperCase()}
                                                {item?.package?.packageId > 0 && <LiaCannabisSolid className="text-theme_green text-sm ml-[1px]" />}
                                            </div>
                                            {item?.mjType == 'MJ' && <div className="text-xs text-gray-500">({item?.package?.itemName})</div>}
                                        </div>
                                                          <div className="w-[4px] h-[1px] bg-white-dark dark:bg-dark mx-[1px]"></div>
                                        <div className="ltr:text-right rtl:text-left">${truncateToTwoDecimals(item?.product?.price)}</div>
                                                          <div className="w-[4px] h-[1px] bg-white-dark dark:bg-dark mx-[1px]"></div>
                                                          <div className="ltr:text-right rtl:text-left">Qty.{formatNumber(item?.posQty)}</div>
                                        {/* <div className='w-[4px] h-[1px] bg-white-dark dark:bg-dark mx-[1px]'></div> */}
                                        <div className="ltr:text-right rtl:text-left">
                                            {/* {quantityAbbreviations[item?.package?.UnitOfMeasureName]} */}
                                            &nbsp;{item?.product?.productUnitOfMeasure}
                                        </div>
                                        {/* <div className='w-[4px] h-[1px] bg-white-dark dark:bg-dark mx-[1px]'></div> */}
                                        <div className="flex justify-end pl-2">
                                                              <div className="relative">
                                                                  {isTooltipVisible == key ? (
                                                                      <div
                                                                          ref={tooltipRef}
                                                                          className={`absolute -top-[165%] -right-[15px] bg-white dark:bg-[#1c2942] rounded-md flex justify-start items-center z-[999]`}
                                                                      >
                                                    <input 
                                                                              type={`${item?.unitOfMeasure == 'ea' ? 'text' : 'number'}`}
                                                        step="0.01" 
                                                                              className="w-20 no-spinner rounded-md rounded-r-none border bg-white text-black !outline-none focus:border-primary focus:ring-transparent dark:border-[#17263c] dark:bg-[#121e32] dark:text-white-dark dark:focus:border-primary px-1 py-2"
                                                        autoFocus={true} 
                                                                              value={orderItemNum === 0 ? '' : orderItemNum}
                                                                              onChange={(e) => setOrderItemNum(e.target.value === '' ? 0 : Number(e.target.value))}
                                                        onKeyDown={(e) => {
                                                                                  if (
                                                                                      !validCreateOrderItem(
                                                                                          item?.packageLabel,
                                                                                          item?.posQty,
                                                                                          item?.product?.productUnitOfMeasure == 'ea' &&
                                                                                              item?.product?.isApplyUnitWeight &&
                                                                                              item?.product?.unitWeight > 0
                                                                                              ? orderItemNum * item?.product?.unitWeight
                                                                                              : orderItemNum
                                                                                      )
                                                                                  ) {
                                                                return 0;
                                                            } else {
                                                                                      if (e.key === 'Enter' && orderItemNum != 0) {
                                                                                          handleCreateOrderItem(
                                                                                              item?.productId || '',
                                                                                              orderItemNum || 0,
                                                                                              item?.product?.price || 0,
                                                                                              item?.cost,
                                                                                              item?.packageLabel,
                                                                                              item?.posQty
                                                                                          );
                                                                    setTooltipVisible(-1);
                                                                }
                                                            }
                                                        }} 
                                                    />
                                                                          <button
                                                                              type="button"
                                                                              className="btn btn-outline-primary btn-small p-[11px] rounded-l-none"
                                                                              disabled={isNewOrderItemButtonDisabled || orderItemNum <= 0 || isCustomerExpired || !customerDataFromOrder?.isActive}
                                                                          >
                                                                              <HiChevronDoubleRight
                                                                                  onClick={() => {
                                                                                      if (
                                                                                          !validCreateOrderItem(
                                                                                              item?.packageLabel,
                                                                                              item?.posQty,
                                                                                              item?.product?.productUnitOfMeasure == 'ea' &&
                                                                                                  item?.product?.isApplyUnitWeight &&
                                                                                                  item?.product?.unitWeight > 0
                                                                                                  ? orderItemNum * item?.product?.unitWeight
                                                                                                  : orderItemNum
                                                                                          )
                                                                                      ) {
                                                                return 0;
                                                            } else {
                                                                                          handleCreateOrderItem(
                                                                                              item?.productId || '',
                                                                                              orderItemNum || 0,
                                                                                              item?.product?.price || 0,
                                                                                              item?.cost,
                                                                                              item?.packageLabel,
                                                                                              item?.posQty
                                                                                          );
                                                                setTooltipVisible(-1);
                                                            }
                                                                                  }}
                                                                              />
                                                    </button>
                                                </div> 
                                                                  ) : null}
                                                                  <button
                                                                      type="button"
                                                                      className="btn btn-outline-primary btn-small p-1 mr-1"
                                                                      disabled={isNewOrderItemButtonDisabled || item?.posQty <= 0 || isCustomerExpired || !customerDataFromOrder?.isActive}
                                                                      onClick={() => {
                                                                          setTooltipVisible((prev) => (prev == key ? -1 : key));
                                                    setOrderItemNum(0);
                                                                      }}
                                                                  >
                                                    <HiChevronDoubleRight />
                                                </button>
                                            </div>

                                            {/* <button
                                                type="button"
                                                className="btn btn-outline-primary btn-small p-1 mr-1"
                                                disabled={isNewOrderItemButtonDisabled}
                                                onClick={() => {
                                                    if (!validCreateOrderItem()) {
                                                        return 0;
                                                    } else {
                                                        setOrderItemData({ productId: item?.id || '', price: item?.price || 0 });
                                                        setOrderItemNum(0);
                                                        setItemNumSetModal(true);
                                                    }
                                                }}
                                            >
                                                <HiChevronDoubleRight />
                                            </button> */}
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-small p-1"
                                                onClick={() => {
                                                                      if (
                                                                          !validCreateOrderItem(
                                                                              item?.packageLabel,
                                                                              item?.posQty,
                                                                              item?.product?.productUnitOfMeasure == 'ea' && item?.product?.isApplyUnitWeight && item?.product?.unitWeight > 0
                                                                                  ? item?.product?.unitWeight
                                                                                  : 1
                                                                          )
                                                                      ) {
                                                        return 0;
                                                    } else {
                                                        // setOrderItemData({id : item?.id || '', quantity: 1, price: item?.price || 0})
                                                        handleCreateOrderItem(item?.productId || '', 1, item?.product?.price || 0, item.cost, item?.packageLabel, item?.posQty);
                                                    }
                                                }}
                                                disabled={isNewOrderItemButtonDisabled || item?.posQty <= 0 || isCustomerExpired || !customerDataFromOrder?.isActive}
                                            >
                                                <HiChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                                  ))
                                                : null}

                                            {/* Loading indicator for iPad view */}
                                            {isInventoryLoading && (
                                                <div className="flex justify-center items-center py-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                    <span className="ml-2">Loading inventory...</span>
                                                </div>
                                            )}

                                            {isFetchingNextPage && (
                                                <div className="flex justify-center items-center py-4">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                    <span className="ml-2">Loading more...</span>
                                                </div>
                                            )}

                                            {/* Intersection Observer trigger for iPad mode */}
                                            {hasNextPage && (
                                                <div ref={loadMoreRefIpad} className="w-full opacity-50 flex items-center justify-center text-xs">
                                                    {/* Scroll trigger */}
                                                </div>
                                            )}

                                            {/* Show error message if there's an error */}
                                            {inventoryError && (
                                                <div className="flex justify-center items-center py-4 text-red-500">
                                                    <div className="text-center">
                                                        <div className="text-sm">Failed to load products</div>
                                                        <button 
                                                            onClick={() => window.location.reload()} 
                                                            className="text-xs underline mt-1 hover:text-red-700"
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show message when no more pages */}
                                            {!hasNextPage && inventoryData.length > 0 && !inventoryError && (
                                                <div className="flex justify-center items-center py-2 text-gray-500 text-sm">
                                                    No more products to load
                                                </div>
                                            )}
                                </>
                            </PerfectScrollbar>
                                    </div>
                                ) : null}
                            {/* <button type="button" className="absolute top-1/2 block -translate-y-1/2 hover:opacity-80 ltr:right-2 rtl:left-2 sm:hidden">
                                <IconXCircle />
                            </button> */}
                        </div>
                        ) : null}
                        <div className="flex items-center">
                            {showPackageInventoryWarning && (
                                <div className="flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light">
                            <span className="ltr:pr-2 rtl:pl-2 flex items-end">
                                {/* <strong className="ltr:mr-1 rtl:ml-1">Warning</strong> */}
                                <FaExclamationTriangle className="text-warning ltr:mr-1 rtl:ml-1 mb-1 text-lg" />
                                <span>{packageInventoryWarningMessage}</span>
                            </span>
                            <button type="button" className="ltr:ml-auto rtl:mr-auto hover:opacity-80">
                                        <FaTimes className="text-warning hover:text-[#e2a13fdb]  cursor-pointer" onClick={() => setShowPackageInventoryWarning(false)} />
                                </button>
                            </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            {/* <select
                                onChange={(e) => {
                                    setOrderNumber(parseInt(e.target.value));
                                    setOrderId(parseInt(e.target.value));
                                }}
                                id="orderNumber"
                                className={`flex-initial w-64 form-select mt-1 ${
                                    orderData?.status == 'PAID'
                                        ? 'text-blue-800 dark:text-blue-300'
                                        : orderData?.status == 'EDIT'
                                        ? 'text-green-800 dark:text-[#35a15c]'
                                        : 'text-amber-800 dark:text-[rgb(159,133,51)]'
                                }`}
                                name="orderNumber"
                                value={orderNumber}
                            >
                                <option key={0} value={0} disabled>
                                    Choose an order ...
                                </option>
                                {ordersData?.map((order: any, index) => (
                                    <option
                                        className={`w-full flex justify-between items-center ${order.orderType == 'RETURN' ? 'bg-amber-100 dark:bg-[rgba(131,80,38,0.3)]' : ''} ${
                                            order.status == 'PAID'
                                                ? 'text-blue-800 dark:text-blue-300'
                                                : order.status == 'EDIT'
                                                ? 'text-green-800 dark:text-green-300 '
                                                : 'text-amber-800 dark:text-amber-300'
                                        }`}
                                        id={order.status}
                                        key={index}
                                        value={order.id}
                                    >
                                        #{String(order.id)}
                                        &nbsp;({order.status}){order.orderType == 'RETURN' ? ' ⟳' : ''}
                                    </option>
                                ))}{' '}
                            </select> */}
                            <div className="flex justify-start items-center text-gray-600 dark:text-inherit mr-2">
                                {/* Totally {ordersData?.length} orders */}
                               
                                {orderCounts.PAID > 0 ? (
                                    <span className="badge !text-[10px] p-[2px] text-success bg-success-light dark:bg-success-dark-light mr-1">{orderCounts.PAID} PAID</span>
                                ) : null}
                                {orderCounts.EDIT > 0 ? <span className="badge !text-[10px] p-[2px] text-info bg-info-light dark:bg-info-dark-light mx-1">{orderCounts.EDIT} EDIT</span> : null}
                                {orderCounts.HOLD > 0 ? (
                                    <span className="badge !text-[10px] p-[2px] text-warning bg-warning-light dark:bg-warning-dark-light mx-1">{orderCounts.HOLD} HOLD</span>
                                ) : null}
                            </div>
                            <div className="relative flex flex-col justify-start items-start">
                                <div className="flex justify-between items-center">
                                    {/* <label className="pt-1 lg:text-right text-dark  mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2 text-nowrap">Order</label> */}

                                    <div
                                        className={`relative bg-white dark:bg-black-dark-light border-[1px] flex justify-start items-center border-gray-200 dark:border-[#1b2e4b] ${
                                            showOrderList ? 'dark:hover:border-primary hover:border-primary ' : ''
                                        } rounded-md px-2 py-1 !w-[223px] cursor-pointer`}
                                        onClick={() => setShowOrderList((prev) => !prev)}
                                    >
                                        #{orderNumber != 0 ? orderNumber : 'select the order'}
                                        {orderData?.status ? (
                                            // <span
                                            //     className={`badge !text-[10px] p-[2px] ml-2 ${
                                            //         orderData?.status == 'PAID'
                                            //             ? 'bg-success-light text-success dark:bg-theme_green dark:text-theme_green-dark'
                                            //             : orderData?.status == 'EDIT'
                                            //             ? 'bg-primary-light text-primary dark:bg-primary dark:text-primary-dark'
                                            //             : 'bg-warning-light text-warning dark:bg-warning dark:text-warning-dark'
                                            //     }`}
                                            // >
                                            //     {orderData?.status}
                                            // </span>
                                            <OrderStatusBadge status={orderData?.status} className="!p-[2px] ml-1" />
                                        ) : null}
                                        {isManualDiscount ? (
                                            <span className=" text-theme_green text-center font-bold ml-1">{/* <FaCheckCircle className='text-theme_green z-50 text-xl'/> */}D</span>
                                        ) : null}
                                        {orderData?.LoyaltyHistory && orderData?.LoyaltyHistory?.length > 0 && orderData?.LoyaltyHistory[0]?.txType == 'spend' ? (
                                            <span className=" text-theme_green text-center font-bold ml-1">{/* <FaCheckCircle className='text-theme_green z-50 text-xl'/> */}L</span>
                                        ) : null}
                                        {orderData?.orderType == 'RETURN' ? (
                                            <span className={`!text-[10px] p-[2px] ml-1 font-bold ${orderData?.orderType == 'RETURN' ? 'text-warning' : ''}`}>
                                                {orderData?.orderType == 'RETURN' ? 'RETURN' : ''}
                                            </span>
                                        ) : null}
                                        {showOrderList ? (
                                            <IoIosArrowUp className="absolute right-2 top-[50%] -translate-y-[50%] text-gray-300 dark:text-[#1c2942] ml-1" />
                                        ) : (
                                            <IoIosArrowDown className="absolute right-2 top-[50%] -translate-y-[50%] text-gray-300 dark:text-[#1c2942] ml-1" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm ml-2 rtl:mr-2 p-2 shadow shadow-indigo-500/50"
                                        disabled={isNewOrderButtonDisabled}
                                        onClick={handleCreateOrder}
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                                {/* <PerfectScrollbar> */}
                                <div
                                    ref={orderListRef}
                                    className={`absolute z-[999] !w-[223px] top-10 left-0 rounded-md flex flex-col h-[500px] border-[1px] border-gray-200 dark:border-[#1b2e4b]  bg-white dark:bg-black shadow-lg shadow-gray-200 dark:shadow-[#060818] overflow-auto cursor-pointer ${
                                        showOrderList ? 'block' : 'hidden'
                                    }`}
                                >
                                    <PerfectScrollbar>
                                        {ordersData && ordersData?.length > 0 ? (
                                            ordersData?.map((item: any, index: any) => (
                                                <div
                                                    key={index}
                                                    className={`relative px-2 py-1 flex justify-start items-center ${
                                                        orderNumber == item?.id ? 'bg-indigo-50 dark:bg-indigo-600 dark:text-indigo-200 text-indigo-900' : 'hover:bg-gray-50 dark:hover:bg-[#141e33] '
                                                    }`}
                                                    onClick={() => {
                                                        setOrderNumber(item?.id || 0);
                                                        setOrderId(item?.id || 0);
                                                        setShowOrderList(false);
                                                    }}
                                                >
                                                    #{item?.id}
                                                    <OrderStatusBadge status={item?.status} className="ml-1 !p-[2px]" />
                                                    {item?.DiscountHistory?.length > 0 ? (
                                                        <span
                                                            // className={`w-[19px] h-[19px] rounded-full font-bold text-center !text-[10px] mx-1 ${
                                                            //     item?.DiscountHistory[0]?.discountMethod == 'BYPERCENT' || item?.DiscountHistory[0]?.discountMethod == 'BYAMOUNT' || item?.DiscountHistory[0]?.discountMethod == "TOAMOUNT"
                                                            //     ? 'bg-theme_green text-white  dark:text-theme_green-dark'
                                                            //     : 'bg-warning-light text-warning dark:bg-warning dark:text-warning-dark'
                                                            // }`}
                                                            className="text-theme_green font-bold ml-1"
                                                        >
                                                            {item?.DiscountHistory[0]?.discountMethod == 'BYPERCENT' ||
                                                            item?.DiscountHistory[0]?.discountMethod == 'BYAMOUNT' ||
                                                            item?.DiscountHistory[0]?.discountMethod == 'TOAMOUNT'
                                                                ? 'D'
                                                                : ''}
                                                        </span>
                                                    ) : null}
                                                    {item?.LoyaltyHistory && item?.LoyaltyHistory?.length > 0 && item?.LoyaltyHistory[0]?.txType == 'spend' ? (
                                                        <span className=" text-theme_green text-center font-bold ml-1">L</span>
                                                    ) : null}
                                                    {item?.orderType == 'RETURN' ? (
                                                        <span className={`!text-[10px] ml-1 ${item?.orderType == 'RETURN' ? 'text-warning' : ''}`}>{item?.orderType}</span>
                                                    ) : null}
                                                    {orderNumber == item?.id ? <FaCheck className="absolute right-3 top-[50%] -translate-y-[50%] text-indigo-500 dark:text-indigo-200 ml-1" /> : null}
                                                </div>
                                            ))
                                        ) : (
                                            <div>There is no order</div>
                                        )}
                                    </PerfectScrollbar>
                                </div>
                                {/* </PerfectScrollbar> */}
                            </div>

                            <CustomerRegisterModal setModalShow={setModalShow} modalShow={modalShow} modalMode={modalMode} dispensaryId={dispensaryId} currentUser={currentUser} />
                        </div>
                    </div>
                </div>
                {/* <BarcodeScanner/> */}
                <div className="flex">
                    <div className="swiper" id="slider">
                        <div className="swiper-wrapper">
                            <Swiper
                                ref={swiperRef}
                                modules={[Navigation, Pagination]}
                                navigation={{
                                    nextEl: '.swiper-button-next-ex5',
                                    prevEl: '.swiper-button-prev-ex5',
                                }}
                                allowTouchMove={false}
                                touchEventsTarget="wrapper"
                                touchMoveStopPropagation={false}
                                onSlideChange={onSlideChange}
                                spaceBetween={10}
                                slidesPerView={currentSlide >= 2 || isIpadMode ? 1 : 2}
                                // breakpoints={{
                                //     1024: {
                                //         slidesPerView: currentSlide >= 2 ? 1 : 2,
                                //         spaceBetween: 10,
                                //     },
                                //     768: {
                                //         slidesPerView: currentSlide >= 2 ? 1 : 2,
                                //         spaceBetween: 10,
                                //     },
                                //     320: {
                                //         slidesPerView: currentSlide >= 2 ? 1 : 2,
                                //         spaceBetween: 10,
                                //     },
                                // }}
                                // key={'true'}
                            >
                                {isIpadMode ? null : (
                                    <SwiperSlide key={1}>
                                    <div className={`h-[99.3%] w-[99.3%] flex flex-col justify-start items-start ${panelType == 'plain' ? 'plain-panel' : 'panel'}`}>
                                        <div className="w-full justify-between mb-3 flex  items-start border-b border-white-light pb-2 dark:border-[#1b2e4b]">
                                                {isIpadMode ? null : (
                                            <div className="w-full flex justify-start items-center relative">
                                                <div className="flex justify-start items-center w-36">
                                                    {/* <CustomSelect
                                                        options={customOptions}
                                                        onChange={handleUpdateCategory}
                                                        currentOption={currentCategory}
                                                        setModalShow={setModalShow}
                                                        showingText='All Categories'
                                                        disabled={false}
                                                        showingSearch={false}
                                                    /> */}

                                                        <CategorySelect onChange={handleUpdateCategory} currentCategoryId={categoryId} />
                                                </div>
                                                    <div className="relative w-full ml-2">
                                                    <div className='flex'>
                                                    <input
                                                        ref={searchInputRef}
                                                        type="text"
                                                        className="peer w-[80%] form-input  bg-gray-100 placeholder:tracking-widest ltr:pl-9 ltr:pr-9 rtl:pl-9 rtl:pr-9 sm:bg-transparent ltr:sm:pr-4 rtl:sm:pl-4 !rounded-r-none"
                                                        placeholder="Search Product & Package..."
                                                        value={search}
                                                        onChange={(e) => {
                                                            setSearch(e.target.value);
                                                            handleSearch(e.target.value);
                                                        }}
                                                    />
                                                    <button className='rounded-l-none border-white-light dark:border-[#253b5c] rounded-md px-3 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark' onClick={() => {searchInputRef.current?.focus()}}>
                                                        <CiBarcode/> 
                                                    </button>
                                                    </div>
                                                    <button type="button" className="absolute inset-0 h-9 w-9 appearance-none peer-focus:text-primary ltr:right-auto rtl:left-auto">
                                                        <IconSearch className="mx-auto" />
                                                    </button>
                                                </div>
                                                <button type="button" className="absolute top-1/2 block -translate-y-1/2 hover:opacity-80 ltr:right-2 rtl:left-2 sm:hidden">
                                                    <IconXCircle />
                                                </button>
                                                    </div>
                                                )}
                                            <RefreshButton onClick={handleRefresh} />
                                        </div>

                                        <Suspense fallback={<p>Loading feed...</p>}>
                                            <div className="w-full table-responsive mt-2 h-[42svh] overflow-y-auto">
                                                <PerfectScrollbar className="overflow-x-hidden">
                                                    <>
                                                        <table className="table-hover">
                                                            <thead className="sticky top-0 z-[1]">
                                                                <tr>
                                                                    {product_columns.map((column, index) => {
                                                                        return (
                                                                            <th key={index} className={column?.class}>
                                                                                {column.label}
                                                                            </th>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                    {inventoryData?.map((item: any, key: any) => {
                                                                return (
                                                                        <Tippy
                                                                            key={key}
                                                                            content={`${
                                                                                item?.product?.isApplyUnitWeight
                                                                                    ? 'Unit Weight: ' + (item?.product?.unitWeight || 0) + item?.product?.unitOfUnitWeight
                                                                                    : ''
                                                                            }\n Net Weight: ${(item?.product?.netWeight || 0) + item?.product?.unitOfNetWeight}`}
                                                                            placement="top"
                                                                        >
                                                                    <tr key={key}>
                                                                        <td>
                                                                            <ProductCategory name={item?.product?.itemCategory?.name} color={item?.product?.itemCategory?.color} />
                                                                        </td>
                                                                        <td className="break-words">{item?.product?.name}</td>
                                                                                <td className="flex justify-start items-center break-words">
                                                                                    {item?.packageLabel.slice(-10).toUpperCase()}
                                                                        {item?.package?.packageId > 0 && <LiaCannabisSolid className="text-theme_green text-sm ml-[1px]" />}
                                                                        {/* <div className="text-xs text-gray-500">({item?.package?.itemName})</div> */}
                                                                        </td>
                                                                        <td className="ltr:text-right rtl:text-left">${truncateToTwoDecimals(item?.product?.price)}</td>
                                                                        <td className="ltr:text-right rtl:text-left">
                                                                                    {item?.product?.productUnitOfMeasure == 'ea' &&
                                                                                    item?.product?.isApplyUnitWeight &&
                                                                                    item?.product?.unitWeight > 0 &&
                                                                                    item?.product?.unitOfUnitWeight !== null ? (
                                                                                        <span className="text-nowrap">
                                                                                            {formatNumber(item?.posQty) +
                                                                                                ' ' +
                                                                                                item?.product?.unitOfUnitWeight +
                                                                                                ' / ' +
                                                                                                truncateToTwoDecimals(item?.posQty / item?.product?.unitWeight) +
                                                                                                ' ' +
                                                                                                item?.product?.productUnitOfMeasure}
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="text-nowrap">{formatNumber(item?.posQty) + ' ' + item?.product?.productUnitOfMeasure}</span>
                                                                                    )}
                                                                        </td>
                                                                        <td className="flex justify-end">
                                                                                    <div className="relative">
                                                                                        {isTooltipVisible == key ? (
                                                                                            <div
                                                                                                ref={tooltipRef}
                                                                                                className={`absolute -top-[165%] -right-[15px] bg-white dark:bg-[#1c2942] rounded-md flex justify-start items-center z-[999]`}
                                                                                            >
                                                                                    <input 
                                                                                                    type={`${item?.productUnitOfMeasure == 'ea' ? 'text' : 'number'}`}
                                                                                        step="0.01" 
                                                                                                    className="w-20 no-spinner rounded-md rounded-r-none border bg-white text-black !outline-none focus:border-primary focus:ring-transparent dark:border-[#17263c] dark:bg-[#121e32] dark:text-white-dark dark:focus:border-primary px-1 py-2"
                                                                                        autoFocus={true} 
                                                                                                    value={orderItemNum === 0 ? '' : orderItemNum}
                                                                                                    onChange={(e) => setOrderItemNum(e.target.value === '' ? 0 : Number(e.target.value))}
                                                                                        onKeyDown={(e) => {
                                                                                                        if (
                                                                                                            !validCreateOrderItem(
                                                                                                                item?.packageLabel,
                                                                                                                item?.posQty,
                                                                                                                item?.product?.productUnitOfMeasure == 'ea' &&
                                                                                                                    item?.product?.isApplyUnitWeight &&
                                                                                                                    item?.product?.unitWeight > 0
                                                                                                                    ? orderItemNum * item?.product?.unitWeight
                                                                                                                    : orderItemNum
                                                                                                            )
                                                                                                        ) {
                                                                                                return 0;
                                                                                            } else {
                                                                                                            if (e.key === 'Enter' && orderItemNum != 0) {
                                                                                                                handleCreateOrderItem(
                                                                                                                    item?.productId || '',
                                                                                                                    orderItemNum || 0,
                                                                                                                    item?.product?.price || 0,
                                                                                                                    item?.cost,
                                                                                                                    item?.packageLabel,
                                                                                                                    item?.posQty
                                                                                                                );
                                                                                                    setTooltipVisible(-1);
                                                                                                }
                                                                                            }
                                                                                        }} 
                                                                                    />
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="btn btn-outline-primary btn-small p-[11px] rounded-l-none"
                                                                                                    disabled={
                                                                                                        isNewOrderItemButtonDisabled ||
                                                                                                        orderItemNum <= 0 ||
                                                                                                        isCustomerExpired ||
                                                                                                        !customerDataFromOrder?.isActive
                                                                                                    }
                                                                                                >
                                                                                                    <HiChevronDoubleRight
                                                                                                        onClick={() => {
                                                                                                            if (
                                                                                                                !validCreateOrderItem(
                                                                                                                    item?.packageLabel,
                                                                                                                    item?.posQty,
                                                                                                                    item?.product?.productUnitOfMeasure == 'ea' &&
                                                                                                                        item?.product?.isApplyUnitWeight &&
                                                                                                                        item?.product?.unitWeight > 0
                                                                                                                        ? orderItemNum * item?.product?.unitWeight
                                                                                                                        : orderItemNum
                                                                                                                )
                                                                                                            ) {
                                                                                                return 0;
                                                                                            } else {
                                                                                                                handleCreateOrderItem(
                                                                                                                    item?.productId || '',
                                                                                                                    orderItemNum || 0,
                                                                                                                    item?.product?.price || 0,
                                                                                                                    item?.cost,
                                                                                                                    item?.packageLabel,
                                                                                                                    item?.posQty
                                                                                                                );
                                                                                                setTooltipVisible(-1);
                                                                                            }
                                                                                                        }}
                                                                                                    />
                                                                                    </button>
                                                                                </div> 
                                                                                        ) : null}
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-outline-primary btn-small p-1 mr-1"
                                                                                            disabled={
                                                                                                isNewOrderItemButtonDisabled ||
                                                                                                item?.posQty <= 0 ||
                                                                                                isCustomerExpired ||
                                                                                                !customerDataFromOrder?.isActive
                                                                                            }
                                                                                            onClick={() => {
                                                                                                setTooltipVisible((prev) => (prev == key ? -1 : key));
                                                                                    setOrderItemNum(0);
                                                                                            }}
                                                                                        >
                                                                                    <HiChevronDoubleRight />
                                                                                </button>
                                                                            </div>

                                                                            {/* <button
                                                                                type="button"
                                                                                className="btn btn-outline-primary btn-small p-1 mr-1"
                                                                                disabled={isNewOrderItemButtonDisabled}
                                                                                onClick={() => {
                                                                                    if (!validCreateOrderItem()) {
                                                                                        return 0;
                                                                                    } else {
                                                                                        setOrderItemData({ productId: item?.id || '', price: item?.price || 0 });
                                                                                        setOrderItemNum(0);
                                                                                        setItemNumSetModal(true);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <HiChevronDoubleRight />
                                                                            </button> */}
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-outline-primary btn-small p-1"
                                                                                onClick={() => {
                                                                                            console.log('----->', item, item?.product?.unitWeight);

                                                                                            if (
                                                                                                !validCreateOrderItem(
                                                                                                    item?.packageLabel,
                                                                                                    item?.posQty,
                                                                                                    item?.product?.productUnitOfMeasure == 'ea' &&
                                                                                                        item?.product?.isApplyUnitWeight &&
                                                                                                        item?.product?.unitWeight > 0
                                                                                                        ? item?.product?.unitWeight
                                                                                                        : 1
                                                                                                )
                                                                                            ) {
                                                                                        return 0;
                                                                                    } else {
                                                                                        // setOrderItemData({id : item?.id || '', quantity: 1, price: item?.price || 0})
                                                                                        
                                                                                                handleCreateOrderItem(
                                                                                                    item?.productId || '',
                                                                                                    1,
                                                                                                    item?.product?.price || 0,
                                                                                                    item.cost,
                                                                                                    item?.packageLabel,
                                                                                                    item?.posQty
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                        disabled={
                                                                                            isNewOrderItemButtonDisabled || item?.posQty <= 0 || isCustomerExpired || !customerDataFromOrder?.isActive
                                                                                        }
                                                                            >
                                                                                <HiChevronRight />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                </Tippy>
                                                                );
                                                            })}
                                                            </tbody>
                                                        </table>

                                                        {/* Loading indicator and intersection observer trigger */}
                                                        {isInventoryLoading && (
                                                            <div className="flex justify-center items-center py-4">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                                <span className="ml-2">Loading inventory...</span>
                                                            </div>
                                                        )}

                                                        {/* Intersection Observer trigger - placed before loading indicator */}
                                                        {hasNextPage && (
                                                            <div ref={loadMoreRef} className="h-4 w-full"></div>
                                                        )}

                                                        {isFetchingNextPage && (
                                                            <div className="flex justify-center items-center py-4">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                                                <span className="ml-2">Loading more...</span>
                                                            </div>
                                                        )}

                                                        {/* Show error message if there's an error */}
                                                        {inventoryError && (
                                                            <div className="flex justify-center items-center py-4 text-red-500">
                                                                <div className="text-center">
                                                                    <div className="text-sm">Failed to load products</div>
                                                                    <button 
                                                                        onClick={() => window.location.reload()} 
                                                                        className="text-xs underline mt-1 hover:text-red-700"
                                                                    >
                                                                        Retry
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Show message when no more pages */}
                                                        {!hasNextPage && inventoryData.length > 0 && !inventoryError && (
                                                            <div className="flex justify-center items-center py-2 text-gray-500 text-sm">
                                                                No more products to load
                                                            </div>
                                                        )}
                                                    </>
                                                </PerfectScrollbar>
                                            </div>
                                        </Suspense>
                                            <div className="w-full flex flex-row flex-wrap justify-start items-center">
                                                {OrderLimitPurchaseData &&
                                                    OrderLimitPurchaseData?.map((item: any, index: any) => {
                                                let widthPercent = 0;
                                                let totalLimit = 0;
                                                        let unitName = '';
                                                purchaseLimitData?.map((data: any) => {
                                                    if (data.purchaseLimitType == item.purchaseLimitType) {
                                                        totalLimit = data.purchaseLimitAmount;
                                                        widthPercent = item.totalQuantity / data.purchaseLimitAmount;
                                                                unitName = data.limitUnit;
                                                    }
                                                        });
                                                return (
                                                            <div className="w-1/3 p-1" key={index}>
                                                            <div className="flex justify-between items-center text-md text-theme_green">
                                                                <h3>{item.purchaseLimitType}</h3>
                                                                    <span className="text-md">
                                                                        {item.totalQuantity}
                                                                        {unitName}/{totalLimit}
                                                                        {unitName}
                                                                    </span>
                                                            </div>
                                                            <div className="w-full h-1 bg-[#ebedf2] dark:bg-dark/40 rounded-full flex">
                                                                    <div
                                                                        className={`bg-theme_green h-1 rounded-full rounded-bl-full text-center text-white text-xs`}
                                                                        style={{ width: `${widthPercent * 100}%` }}
                                                                    ></div>
                                                            </div>
                                                        </div>
                                                        );
                                                    })}
                                        </div>
                                    </div>
                                    </SwiperSlide>
                                )}
                                <SwiperSlide key={2}>
                                    <div
                                        className={`h-[99.3%] w-[99.5%]  ${panelType == 'plain' ? 'plain-panel' : 'panel'} ${
                                            orderData?.orderType == 'RETURN' ? 'bg-warning-light shadow-warning' : ''
                                        }`}
                                    >
                                        <div className={`min-h-[54px] justify-between items-center -m-5 mb-5 flex border-b border-white-light px-5 dark:border-[#1b2e4b]`}>
                                            {orderNumber === 0 ? (
                                                ''
                                            ) : (
                                                <div className="w-full flex justify-between items-center py-2">
                                                    <div className="flex justify-between items-center w-full">
                                                        <div className="flex justify-start items-center">
                                                            <Tippy content="Select Customer">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-primary p-2 mr-2 shadow shadow-indigo-500/50"
                                                                    disabled={orderNumber == null}
                                                                    onClick={() => {
                                                                        setIsCustomerSelectShow(!isCustomerSelectShow);
                                                                        setUserPanelShow(false);
                                                                    }}
                                                                >
                                                                    <RiUserSearchFill size={20} />
                                                                </button>
                                                            </Tippy>

                                                            {isCustomerSelectShow ? (
                                                                <div className="font-semibold w-64">
                                                                    <CustomUserSelect
                                                                        options={customerOptions}
                                                                        onChange={handleUpdateCustomer}
                                                                        currentOption={orderData?.customer?.name}
                                                                        setModalShow={setModalShow}
                                                                        onSearch={handleCustomerSearch}
                                                                        isAddCustomerIcon={true}
                                                                        autoFocus={true}
                                                                        disabled={orderNumber == null}
                                                                        isSelectOpen={isCustomerSelectShow}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                ''
                                                            )}
                                                            <div className="group font-semibold items-center mx-2 cursor-pointer">
                                                                <p className="text-lg text-indigo-500 drop-shadow-2xl shadow-indigo-500/50" onClick={() => setUserPanelShow(!userPanelShow)}>
                                                                    {orderData?.customer?.name}
                                                                </p>
                                                                {/* <PerfectScrollbar> */}
                                                                <div
                                                                    className={`absolute !z-[1000] left-[-150px] top-12 ${
                                                                        userPanelShow ? 'block' : 'hidden'
                                                                    } bg-white w-[500px] border-[1px] border-gray-200 rounded-lg dark:bg-[rgb(0,11,27)] dark:border-[rgb(0,11,27)] shadow-lg shadow-gray-400 dark:shadow-[#070b12] px-3`}
                                                                >
                                                                    <Tab.Group>
                                                                        <Tab.List className="flex flex-wrap border-b border-white-light dark:border-[#191e3a] mt-2">
                                                                            <Tab as={Fragment}>
                                                                                {({ selected }) => (
                                                                                    <div
                                                                                        className={`${
                                                                                            selected ? '!border-secondary text-secondary !outline-none dark:!bg-[#191e3a]' : ''
                                                                                        } flex w-1/2 justify-center items-center border-t-2 border-transparent bg-[#f6f7f8] p-7 py-3 before:inline-block hover:border-secondary hover:text-secondary dark:bg-transparent dark:hover:bg-[#191e3a]`}
                                                                                    >
                                                                                        <div className="flex justify-center items-center">
                                                                                            <IoMdPerson className="mr-2" />
                                                                                            Info
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </Tab>
                                                                            <Tab as={Fragment}>
                                                                                {({ selected }) => (
                                                                                    <div
                                                                                        className={`${
                                                                                            selected ? '!border-secondary text-secondary !outline-none dark:!bg-[#191e3a]' : ''
                                                                                        } flex w-1/2 justify-center items-center border-t-2 border-transparent bg-[#f6f7f8] p-7 py-3 before:inline-block hover:border-secondary hover:text-secondary dark:bg-transparent dark:hover:bg-[#191e3a]`}
                                                                                    >
                                                                                        <div className="flex justify-center items-center text-center">
                                                                                            <RiHistoryFill className="mr-2" /> History
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </Tab>
                                                                            {/* <Tab className="pointer-events-none -mb-[1px] block p-3.5 py-2 text-white-light outline-none dark:text-dark">Disabled</Tab> */}
                                                                        </Tab.List>
                                                                        <Tab.Panels>
                                                                            <Tab.Panel>
                                                                                <div className="w-full overflow-auto py-2 !z-[100]">
                                                                                    <UserCaption orderData={orderData} isAgeVerified={isAgeVerified} dispensaryData={dispensaryData} />
                                                                                </div>
                                                                            </Tab.Panel>
                                                                            <Tab.Panel>
                                                                                <PerfectScrollbar>
                                                                                    <div className="flex flex-col w-full !h-[400px] py-2  overflow-auto">
                                                                                        {/* <div className="w-full text-md text-dark text-center text-lg p-2">Order History</div> */}
                                                                                        <table className="w-full !border-0 overflow-y-auto table-hover">
                                                                                            <thead>
                                                                                                <tr>
                                                                                                    <th className="text-gray-600 dark:text-gray-400 !py-2 !px-3 text-center text-nowrap">Order #</th>
                                                                                                    <th className="text-gray-600 dark:text-gray-400 !py-2 !px-3 text-center">Order Date</th>
                                                                                                    <th className="text-gray-600 dark:text-gray-400 !py-2 !px-3 text-center">Amount</th>
                                                                                                    <th className="text-gray-600 dark:text-gray-400 !py-2 !px-3 text-center">Return</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                {Array.isArray(userOrderData) && userOrderData.length > 0 ? (
                                                                                                    userOrderData.map((data: any) => (
                                                                                                        <tr key={data?.id}>
                                                                                                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 text-right">#{data?.id}</td>
                                                                                                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 text-center">
                                                                                                                {convertPSTTimestampToTimezone(Number(data?.orderDate), userTimeZone)}
                                                                                                                {/* {DateConverter(Number(data?.orderDate))} */}
                                                                                                            </td>
                                                                                                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 text-right">
                                                                                                                ${truncateToTwoDecimals(data?.amount)}
                                                                                                            </td>
                                                                                                            <td className="text-gray-600 dark:text-gray-400 text-xs !py-2 flex justify-center">
                                                                                                                {' '}
                                                                                                                {/* <button
                                                                                                                    className="btn btn-outline-warning !p-1"
                                                                                                                    onClick={() => {
                                                                                                                        setOriginalOrderId(data?.id || 0);
                                                                                                                        handleOrderReturn(data?.id || 0);
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Return
                                                                                                                </button> */}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    ))
                                                                                                ) : (
                                                                                                    <tr>
                                                                                                        <td className="text-gray-600 dark:text-gray-400 text-md text-right">
                                                                                                            There is no order history
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                )}
                                                                                            </tbody>
                                                                                        </table>

                                                                                        <ul className="inline-flex justify-end items-end mr-4 my-2">
                                                                                            <li>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="flex justify-center font-semibold px-[11px] py-[11px] rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-dark dark:bg-[#191e3a] dark:hover:bg-primary"
                                                                                                    onClick={() => setOrderHistoryPage((prev) => (prev === 1 ? prev : prev - 1))}
                                                                                                >
                                                                                                    <FaAngleLeft />
                                                                                                </button>
                                                                                            </li>
                                                                                            <li>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className={`flex justify-center font-semibold px-3.5 py-2 rounded-full transition  text-dark ${
                                                                                                        orderHistoryPage == 1 ? 'bg-primary dark:bg-primary text-white' : 'bg-white-light'
                                                                                                    } dark:text-white-dark dark:bg-[#191e3a] dark:hover:bg-primary hover:bg-primary hover:text-white mx-1`}
                                                                                                    onClick={() => setOrderHistoryPage(orderHistoryPage == 1 ? orderHistoryPage : orderHistoryPage - 1)}
                                                                                                >
                                                                                                    {orderHistoryPage == 1 ? orderHistoryPage : orderHistoryPage - 1}
                                                                                                </button>
                                                                                            </li>
                                                                                            {userOrderDataTotal > 8 ? (
                                                                                                <li>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className={`flex justify-center font-semibold px-3.5 py-2 rounded-full transition  mr-1 ${
                                                                                                            orderHistoryPage > 1 ? 'bg-primary dark:bg-primary text-white' : 'bg-white-light'
                                                                                                        }   dark:text-white-dark dark:bg-[#191e3a] dark:hover:bg-primary hover:bg-primary hover:text-white`}
                                                                                                        onClick={() =>
                                                                                                            setOrderHistoryPage(orderHistoryPage == 1 ? orderHistoryPage + 1 : orderHistoryPage)
                                                                                                        }
                                                                                                    >
                                                                                                        {orderHistoryPage == 1 ? orderHistoryPage + 1 : orderHistoryPage}
                                                                                                    </button>
                                                                                                </li>
                                                                                            ) : null}
                                                                                            {userOrderDataTotal > 16 ? (
                                                                                                <li>
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className="flex justify-center font-semibold px-3.5 py-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-dark dark:bg-[#191e3a] dark:hover:bg-primary mr-1 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                                                                                                        onClick={() =>
                                                                                                            setOrderHistoryPage(orderHistoryPage == 1 ? orderHistoryPage + 2 : orderHistoryPage + 1)
                                                                                                        }
                                                                                                        disabled={userOrderDataTotal / 8 < orderHistoryPage + 1}
                                                                                                    >
                                                                                                        {orderHistoryPage == 1 ? orderHistoryPage + 2 : orderHistoryPage + 1}
                                                                                                    </button>
                                                                                                </li>
                                                                                            ) : null}
                                                                                            <li>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="flex justify-center font-semibold px-[11px] py-[11px] rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-dark dark:bg-[#191e3a] dark:hover:bg-primary"
                                                                                                    onClick={() => setOrderHistoryPage((prev) => (prev < userOrderDataTotal / 8 ? prev + 1 : prev))}
                                                                                                >
                                                                                                    <FaAngleRight />
                                                                                                </button>
                                                                                            </li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </PerfectScrollbar>
                                                                            </Tab.Panel>
                                                                        </Tab.Panels>
                                                                    </Tab.Group>
                                                                    <button type="button" className="btn btn-outline-secondary w-full" onClick={() => setUserPanelShow(false)}>
                                                                        Close
                                                                    </button>
                                                                </div>
                                                                {/* </PerfectScrollbar> */}
                                                            </div>
                                                            {customerDataFromOrder?.isTaxExempt ? <span className="badge text-warning bg-warning-light dark:bg-warning-dark">Tax Exempt</span> : null}
                                                            {customerDataFromOrder?.isActive == false ? (
                                                                <span className="badge text-warning bg-warning-light dark:bg-warning-dark-light text-sm ml-2">Inactive</span>
                                                            ) : null}
                                                            {isCustomerExpired ? (
                                                                <span className="badge text-danger bg-danger-light dark:bg-danger-dark-light text-sm text-nowrap ml-2">License Expired</span>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    {orderData?.orderType == 'RETURN' ? (
                                                        <div className="flex justify-center items-center">
                                                            {/* <span className="badge rounded-full capitalize hover:top-0 hover:text-white badge-outline-warning hover:bg-warning mx-2">Return</span> */}
                                                            <select
                                                                onChange={(e) => {
                                                                    // var orderItem = e.target.value;
                                                                    // handleCreateOrderForReturn(orderItem, 1);
                                                                    setCancelOrderItemId(e.target.value.split(',')[0]);
                                                                    setReturnOrderItemPackageLabel(e.target.value.split(',')[1]);
                                                                    setShowCancelOrderItemModal(true);
                                                                }}
                                                                id="orderNumber"
                                                                className={`flex-initial w-48 form-select mt-1 mx-2 text-dark dark:text-white-dark`}
                                                                name="orderNumber"
                                                                value={originalOrderId}
                                                            >
                                                                <option value="#" className="text-dark dark:text-white-dark">
                                                                    Items in #{originalOrderId}
                                                                </option>
                                                                {originalOrderItems?.map((item: any) => (
                                                                    <option key={item?.id} value={item?.productId + ',' + item?.packageLabel}>
                                                                        {item?.product?.name}&nbsp;&nbsp;&nbsp;
                                                                        {item?.quantity}s
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}
                                            {birthdayShow ? <BirthdayAlert name={orderData?.customer?.name || ''} setBirthdayShow={setBirthdayShow} /> : null}
                                        </div>
                                        <div className="table-responsive relative mt-2 h-[42svh] overflow-y-auto">
                                            <PerfectScrollbar className="overflow-x-hidden">
                                                <table className="w-[100%] table-hover">
                                                    <thead className="sticky top-0 z-[1]">
                                                        <tr>
                                                            {itemColumns.map((column, key) => {
                                                                return (
                                                                    <th key={key} className={column?.class}>
                                                                        {column.label}
                                                                    </th>
                                                                );
                                                            })}
                                                            <th key="handle">
                                                                <Tippy content="Remove All" placement="top">
                                                                    <button
                                                                        type="button"
                                                                        className={`btn btn-outline-warning p-1 float-left ${orderData?.OrderItem?.length ? 'visible' : 'invisible'}`}
                                                                        disabled={showCheckOut}
                                                                        onClick={() => {
                                                                            deleteAllAlert(orderNumber);
                                                                        }}
                                                                    >
                                                                        <MdOutlineClear />
                                                                    </button>
                                                                </Tippy>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orderItemsList && orderItemsList.length > 0 ? (
                                                            orderItemsList.map((item: any, index: any) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        {/* <td>
                                                                            <ProductCategory
                                                                                name={item?.package?.itemProductCategoryName}
                                                                                color="#343245"
                                                                            />
                                                                        </td> */}
                                                                        <td className="">{item?.product?.name}</td>
                                                                        <td className="flex flex-col justify-start">
                                                                            <span className="flex justify-start items-center">
                                                                            {item?.packageLabel?.slice(-10)?.toUpperCase()}
                                                                                {item?.mjType == 'MJ' && <LiaCannabisSolid className="text-theme_green text-sm ml-[1px]" />}
                                                                            </span>
                                                                            {item?.mjType == 'MJ' && <div className="text-xs text-gray-500">({item?.package?.itemName})</div>}
                                                                        </td>
                                                                        <td className="ltr:text-right rtl:text-left">${truncateToTwoDecimals(item?.product?.price)}</td>
                                                                        <td className="ltr:text-right rtl:text-left">
                                                                            {item?.product?.productUnitOfMeasure == 'ea' &&
                                                                            item?.product?.isApplyUnitWeight &&
                                                                            item?.product?.unitWeight > 0 &&
                                                                            item?.product?.unitOfUnitWeight !== null ? (
                                                                                <span className="text-nowrap">
                                                                                    {formatNumber(item?.quantity) +
                                                                                        ' ' +
                                                                                        item?.product?.unitOfUnitWeight +
                                                                                        ' / ' +
                                                                                        truncateToTwoDecimals(item?.quantity / item?.product?.unitWeight) +
                                                                                        ' ' +
                                                                                        item?.product?.productUnitOfMeasure}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-nowrap">{formatNumber(item?.quantity) + ' ' + item?.product?.productUnitOfMeasure || ''}</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="ltr:text-right rtl:text-left">
                                                                            {orderData?.DiscountHistory && orderData?.DiscountHistory.length > 0 ? (
                                                                                <div className="flex justify-between items-center">
                                                                                    {/* <DiscountLabel discountData={orderData?.DiscountHistory} orderId={orderid}/> */}
                                                                                    <div className="inline-flex items-center justify-center text-xs">
                                                                                        {/* <span className="mr-1">-{discount}%</span> */}
                                                                                        <div className="dropdown">
                                                                                            <Dropdown
                                                                                                placement={`${'bottom-end'}`}
                                                                                                btnClassName="dropdown-toggle flex justify-between items-center px-2 py-1 font-bold rounded border border-theme_green text-theme_green shadow-none hover:bg-theme_green hover:text-white z-10"
                                                                                                button={
                                                                                                    <>
                                                                                                        D
                                                                                                        <span>
                                                                                                            <MdKeyboardArrowDown className="ml-1" />
                                                                                                        </span>
                                                                                                    </>
                                                                                                }
                                                                                            >
                                                                                                <ul className="!min-w-[170px]">
                                                                                                    {orderData?.DiscountHistory?.map((item: any, key: any) => (
                                                                                                        <li key={key}>
                                                                                                            <div className="flex justify-between items-center px-4 py-2 text-gray-700 dark:text-inherit hover:bg-gray-100 hover:text-primary dark:hover:bg-primary/10">
                                                                                                                <div className="flex flex-col w-full items-center mr-5">
                                                                                                                    <span className="text-lg text-nowrap">{item?.discountName}</span>
                                                                                                                    <div className="flex justify-between items-center">
                                                                                                                        <span className="text-md mr-2">{item?.discountMethod} </span>
                                                                                                                        {item?.discountMethod == 'BYPERCENT' ? '' : '$'}
                                                                                                                        <span>{truncateToTwoDecimals(item?.value)}</span>
                                                                                                                        {item?.discountMethod == 'BYPERCENT' ? '%' : ''}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <FaRegTimesCircle
                                                                                                                    className="text-warning text-xl cursor-pointer"
                                                                                                                    onClick={() => handleCancelDiscount()}
                                                                                                                />
                                                                                                            </div>
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ul>
                                                                                            </Dropdown>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex flex-col justify-center items-start ml-2">
                                                                                        <span className="">${truncateToTwoDecimals(item?.amount || 0)}</span>
                                                                                        -${truncateToTwoDecimals(item?.discountedAmount) || 0}
                                                                                    </div>
                                                                                </div>
                                                                            ) : null}
                                                                            {orderData?.LoyaltyHistory && orderData?.LoyaltyHistory.length > 0 ? (
                                                                                <div className="flex justify-between items-center">
                                                                                    <div className="inline-flex items-center justify-center text-xs">
                                                                                        {/* <span className="mr-1">-{discount}%</span> */}
                                                                                        <div className="dropdown">
                                                                                            <Dropdown
                                                                                                placement={`${'bottom-end'}`}
                                                                                                btnClassName="dropdown-toggle flex justify-between items-center px-2 py-1 font-bold rounded border border-theme_green text-theme_green shadow-none hover:bg-theme_green hover:text-white z-10"
                                                                                                button={
                                                                                                    <>
                                                                                                        L
                                                                                                        <span>
                                                                                                            <MdKeyboardArrowDown className="ml-1" />
                                                                                                        </span>
                                                                                                    </>
                                                                                                }
                                                                                            >
                                                                                                <ul className="!min-w-[170px]">
                                                                                                    {orderData?.LoyaltyHistory?.map((item: any, key: any) => (
                                                                                                        <li key={key}>
                                                                                                            <div className="flex justify-between items-center px-4 py-2 text-gray-700 dark:text-inherit hover:bg-gray-100 hover:text-primary dark:hover:bg-primary/10">
                                                                                                                <div className="flex flex-col w-full items-center mr-5">
                                                                                                                    <span className="text-lg text-nowrap">{item?.loyaltyName}</span>
                                                                                                                    <div className="flex justify-between items-center">
                                                                                                                        <span className="text-md mr-2">{item?.loyaltyType} </span>
                                                                                                                        {item?.loyaltyType == 'MANUAL' ? '$' : ''}
                                                                                                                        <span>{truncateToTwoDecimals(item?.loyaltyWorth * item?.value)}</span>
                                                                                                                        {/* {item?.discountMethod == 'BYPERCENT' ? '%' : ''} */}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <FaRegTimesCircle
                                                                                                                    className="text-warning text-xl cursor-pointer"
                                                                                                                    onClick={() => handleCacelLoyalty()}
                                                                                                                />
                                                                                                            </div>
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ul>
                                                                                            </Dropdown>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex flex-col justify-center items-start ml-2">
                                                                                        <span className="">${truncateToTwoDecimals(item?.amount) || 0}</span>
                                                                                        -${truncateToTwoDecimals(item?.loyaltyAmount)}
                                                                                    </div>
                                                                                </div>
                                                                            ) : null}
                                                                            {orderData?.DiscountHistory &&
                                                                            orderData?.DiscountHistory.length == 0 &&
                                                                            orderData?.LoyaltyHistory &&
                                                                            orderData?.LoyaltyHistory.length == 0 ? (
                                                                                <span>${truncateToTwoDecimals(item?.amount) || 0}</span>
                                                                            ) : null}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-outline-warning p-1"
                                                                                onClick={() => {
                                                                                    deleteAlert(item?.id || '', item?.packageLabel || '', item?.quantity || 0);
                                                                                }}
                                                                                disabled={isDeleteOrderItemButtonDisabled || showCheckOut}
                                                                            >
                                                                                <MdOutlineClear />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={6} className="text-center">
                                                                    No items found
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </PerfectScrollbar>
                                        </div>
                                        <hr className="my-2 border-white-light dark:border-[#1b2e4b]" />
                                        <div className="flex flex-col justify-between gap-6 sm:flex-row">
                                            <div className="w-1/3">
                                                {isIpadMode ? (
                                                    <div className="w-full flex flex-row flex-wrap justify-start items-center">
                                                        {OrderLimitPurchaseData &&
                                                            OrderLimitPurchaseData?.map((item: any, index: any) => {
                                                        let widthPercent = 0;
                                                        let totalLimit = 0;
                                                                let unitName = '';
                                                        purchaseLimitData?.map((data: any) => {
                                                            if (data.purchaseLimitType == item.purchaseLimitType) {
                                                                totalLimit = data.purchaseLimitAmount;
                                                                widthPercent = item.totalQuantity / data.purchaseLimitAmount;
                                                                        unitName = data.limitUnit;
                                                            }
                                                                });
                                                        return (
                                                                    <div className="w-1/3 p-1" key={index}>
                                                                    <div className="flex justify-between items-center text-md text-theme_green">
                                                                        <h3>{item.purchaseLimitType}</h3>
                                                                            <span className="text-md">
                                                                                {item.totalQuantity}
                                                                                {unitName}/{totalLimit}
                                                                                {unitName}
                                                                            </span>
                                                                    </div>
                                                                    <div className="w-full h-1 bg-[#ebedf2] dark:bg-dark/40 rounded-full flex">
                                                                            <div
                                                                                className={`bg-theme_green h-1 rounded-full rounded-bl-full text-center text-white text-xs`}
                                                                                style={{ width: `${widthPercent * 100}%` }}
                                                                            ></div>
                                                                    </div>
                                                                </div>
                                                                );
                                                            })}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div className="w-1/3">
                                                <div className="mb-2 flex w-full items-center justify-between">
                                                    <div className="text-white-dark">Tax (Included):</div>
                                                    <div>${tax.toFixed(2) || 0}</div>
                                                </div>
                                                <div className="mb-2 flex w-full items-center justify-between">
                                                    <div className="text-white-dark">Loyalty :</div>
                                                    <div>${loyaltySpend.toFixed(2)}</div>
                                                </div>
                                                <div className="mb-2 flex w-full items-center justify-between">
                                                    <div className="text-white-dark">Discount :</div>
                                                    <div>${discount?.toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <div className="w-1/3">
                                                <div className="mb-2 flex w-full items-center justify-between">
                                                    <div className="text-white-dark">Total Items:</div>
                                                    <div className="whitespace-nowrap">{totalItems}</div>
                                                </div>
                                                <div className="mb-2 flex w-full items-center justify-between">
                                                    <div className="text-white-dark">Subtotal:</div>
                                                    <div className="whitespace-nowrap">${subTotal?.toFixed(2)}</div>
                                                </div>
                                                <div className="mb-2 flex w-full items-center justify-between">
                                                    <div className="text-white-dark">Grand Total:</div>
                                                    <div className="font-bold text-lg">${grandTotal.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide key={3} className="!w-[100%]">
                                    {orderData?.orderType != 'RETURN' ? (
                                        <div className={`h-full panel ${panelType == 'plain' ? 'plain-panel' : ''}`}>
                                            <CheckoutPanel
                                                orderNumber={orderNumber}
                                                amount={new Decimal(grandTotal.toFixed(2)).toNumber()}
                                                payAmount={new Decimal(payAmount.toFixed(2)).toNumber()}
                                                otherAmount={new Decimal(otherAmount.toFixed(2)).toNumber()}
                                                setOtherAmount={setOtherAmount}
                                                setPayAmount={setPayAmount}
                                                isCashed={isCashed}
                                                setIsCashed={setIsCashed}
                                                currentSlide={currentSlide}
                                            />
                                        </div>
                                    ) : (
                                        <PerfectScrollbar>
                                            <div className={`panel h-full  ${panelType == 'plain' ? 'plain-panel' : ''} flex flex-col dark:bg-[#0e1726]`}>
                                                <div className="flex justify-center items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light">
                                                    <span className="">
                                                        <strong className="ltr:mr-1 rtl:ml-1">Return!</strong> Please decide to restock products or not and fill out a reason for the return.
                                                    </span>
                                                </div>
                                                <PerfectScrollbar className="!h-[500px]">
                                                    <div className="flex-1 max-w-2xl mt-3 mx-auto w-full p-4 space-y-4 dark:bg-[#141e33]">
                                                        {orderItemsList?.map((item, index) => (
                                                            <div key={index} className="!bg-white dark:!bg-[#1e2e4c]  rounded-lg shadow p-4 my-2">
                                                                <div className="flex justify-between items-center">
                                                                    <ProductCategory name={item?.product?.itemCategory?.name} color={item?.product?.itemCategory?.color} />
                                                                    <div className="text-lg text-gray-700 dark:!text-[#888ea8]">{item?.product.name}</div>
                                                                    {/* <div className="text-lg text-gray-700 dark:!text-[#888ea8]">{item?.product?.itemCategory?.name}</div> */}
                                                                    {/* <div className="flex items-center gap-2">
                                                                    <span className="text-gray-600 dark:!text-[#888ea8]">Restock</span>
                                                                    <button
                                                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${restock ? 'bg-green-400' : 'bg-gray-200'}`}
                                                                        onClick={() => {
                                                                            // setRestock(!restock);
                                                                            handleOrderReStock(item?.id, !restock);
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                                                                                restock ? 'translate-x-6' : 'translate-x-0'
                                                                            }`}
                                                                        />
                                                                    </button>
                                                                </div> */}
                                                                    <label className="w-12 h-6 relative">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="custom_switch absolute w-full h-full opacity-0 cursor-pointer peer"
                                                                            id="custom_switch_checkbox1"
                                                                            checked={item?.isRestockForReturn === true ? true : false}
                                                                            onChange={() => handleOrderReStock(item?.id, !item?.isRestockForReturn)}
                                                                        />
                                                                        <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="!bg-white dark:!bg-[#1e2e4c] dark:!text-[#888ea8] rounded-lg shadow p-4">
                                                            <textarea
                                                                placeholder="Leave a note here to provide a Reason for the return"
                                                                value={returnReason}
                                                                onChange={(e) => setReturnReason(e.target.value)}
                                                                className="w-full min-h-[100px] dark:!bg-[#1e2e4c] resize-none border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                                                            />
                                                        </div>
                                                    </div>
                                                </PerfectScrollbar>
                                                {/* <div className="border-t bg-white p-4">
                                                    <div className="max-w-2xl mx-auto w-full flex justify-between">
                                                        <button className="text-gray-600 flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                            Modify Order
                                                        </button>
                                                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded">Complete Return</button>
                                                    </div>
                                                </div> */}
                                            </div>
                                        </PerfectScrollbar>
                                    )}
                                </SwiperSlide>
                                <SwiperSlide key={4} className="!w-[100vw-260px]">
                                    <div
                                        className={`flex flex-wrap justify-between content-start items-center h-full w-full text-dark dark:text-white-dark dark:text-inherit ${
                                            panelType == 'plain' ? 'plain-panel' : 'panel'
                                        }`}
                                    >
                                        <div className="flex flex-col md:w-full w-1/2 mx-auto">
                                            <div className="mb-5 !w-full flex justify-center items-center border-b bg-theme_green border-white-light py-2 px-5 dark:border-[#1b2e4b] text-xl text-white dark:text-theme_green-dark rounded-t-md">
                                                {/* <div className={`success-checkmark dark:!bg-black-dark-light ${currentSlide == 2 ? 'block' : 'hidden'}`}>
                                                    <div className="check-icon my-1 dark:after:!bg-black dark:before:!bg-black">
                                                        <span className="icon-line line-tip"></span>
                                                        <span className="icon-line line-long"></span>
                                                        <div className="icon-circle"></div>
                                                        <div className="icon-fix dark:!bg-black"></div>
                                                    </div>
                                                </div> */}
                                                <FaRegCircleCheck className="text-3xl text-white dark:text-theme_green-dark mr-3" />
                                                Order #{orderNumber} {orderData?.orderType == 'RETURN' ? 'Return' : ''} Complete
                                            </div>

                                            <div className="flex flex-col justify-center items-end text-xl text-center mt-2 w-full">
                                                <div className="flex justify-between items-center mx-auto">
                                                Total {orderData?.orderType == 'RETURN' ? 'Return' : ''}:
                                                <p className="text-3xl font-bold ml-3">
                                                        $
                                                        {orderData?.status == 'PAID'
                                                            ? truncateToTwoDecimals((orderData?.cashAmount || 0) + (orderData.otherAmount || 0) - (orderData?.changeDue || 0))
                                                            : truncateToTwoDecimals(grandTotal)}
                                                </p>
                                                </div>
                                                <div className="flex justify-center items-center">
                                                    {loyaltySpendPoint && loyaltySpendPoint > 0 ? (
                                                        <span className="text-success mx-auto text-sm mr-2">Loyalty Spent: ${loyaltySpendPoint} </span>
                                                    ) : null}
                                                    {loyaltyEarnedPoint && loyaltyEarnedPoint > 0 ? (
                                                        <span className="text-success mx-auto text-sm">Loyalty Earned: {truncateToTwoDecimals(loyaltyEarnedPoint)} </span>
                                                    ) : null}
                                                </div>
                                                {discount && discount > 0 ? <span className="text-success mx-auto text-sm">Discount: ${truncateToTwoDecimals(discount)}</span> : null}
                                            </div>
                                            <div className="w-full text-md flex items-center justify-between px-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="relative text-center text-lg pb-1 text-dark dark:text-white-dark border-gray-300 dark:border-[#1b2e4b] mr-2">
                                                        <div className="flex justify-center items-center cursor-pointer" onClick={() => setShowUserCaption(!showUserCaption)}>
                                                            <FaUserLarge className="text-sm" />
                                                            <span className="text-xl font-bold ml-2">{orderData?.customer?.name}</span>
                                                        </div>
                                                        {/* <span className='text-lg font-bold'>{orderData?.customer?.medicalLicense}</span> */}
                                                        <div
                                                            ref={userCaptionRef}
                                                            className={`absolute h-[328px] min-w-[330px] flex flex-col z-10 top-[90%] left-0 bg-white  border-gray-200 rounded-lg dark:bg-[rgb(0,11,27)] dark:border-[rgb(0,11,27)] shadow-lg shadow-gray-400 dark:shadow-[#070b12] ${
                                                                showUserCaption ? 'block' : 'hidden'
                                                            }`}
                                                        >
                                                            <div className="text-secondary bg-gray-100 dark:bg-purple-800/20 rounded-t-lg p-1 text-sm font-semibold">Customer Info</div>
                                                            <div className="pl-2 h-[300px]">
                                                                <UserCaption orderData={orderData} isAgeVerified={isAgeVerified} dispensaryData={dispensaryData} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:w-full w-1/2 flex flex-col items-start rounded-md border-[1px] border-gray-300 dark:border-[#1b2e4b] mx-auto mt-3 p-3">
                                            <div className="table-responsive w-full mt-2 h-[35svh] overflow-y-auto overflow-x-auto">
                                                <PerfectScrollbar>
                                                    <table className="overflow-auto table-hover">
                                                        <thead className="sticky top-0 z-[1]">
                                                            <tr>
                                                                <th>Category</th>
                                                                <th>Product Name</th>
                                                                <th>Package</th>
                                                                <th>Price</th>
                                                                <th>Quantity</th>
                                                                <th>Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="overflow-auto">
                                                            {orderItemsList?.map((item, key) => (
                                                                <tr key={key}>
                                                                    {/* <td>
                                                                        <ProductCategory name={item?.package?.itemProductCategoryName} color="#878767" />
                                                                    </td> */}
                                                                    <td className="text-left">
                                                                        <ProductCategory name={item?.product?.itemCategory.name} color={item?.product?.itemCategory.color} />
                                                                    </td>
                                                                    <td className="text-left">{item?.product?.name}</td>
                                                                    <td className="text-left flex flex-col justify-start">
                                                                        <span className="flex justify-start items-center">
                                                                        {item?.packageLabel?.slice(-10)?.toUpperCase()}
                                                                            {item?.mjType == 'MJ' && <LiaCannabisSolid className="text-theme_green text-sm ml-[1px]" />}
                                                                        </span>
                                                                        
                                                                        {item?.mjType == 'MJ' && <div className="text-xs text-gray-500">({item?.package?.itemName})</div>}
                                                                    </td>
                                                                    <td className="text-left">{truncateToTwoDecimals(item?.product.price) ? '$' + truncateToTwoDecimals(item?.product.price) : ''}</td>
                                                                    <td className="text-left">
                                                                        {truncateToTwoDecimals(item?.quantity)} {item?.product?.productUnitOfMeasure}
                                                                    </td>
                                                                    <td className="text-left">
                                                                        $
                                                                        {truncateToTwoDecimals(
                                                                            multiplyResult(item?.product.price || 1, item?.quantity || 0) -
                                                                                Number(truncateToTwoDecimals(item?.discountedAmount || 0)) -
                                                                                Number(truncateToTwoDecimals(item?.loyaltyAmount || 0))
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </PerfectScrollbar>
                                            </div>
                                            <div className="absolute -bottom-32 -right-20">
                                                <svg width="500" height="500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-success opacity-20 w-full h-full">
                                                    <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                                                    <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`panel mt-2 !py-3 flex justify-between items-end ${panelType == 'plain' ? 'plain-panel' : ''}`}>
                <div className="flex justify-start">
                    {currentSlide === 0 && orderData?.status == 'EDIT' && orderData?.orderType == 'SALE' ? (
                        <button
                            type="button"
                            className="relative btn btn-outline-primary mr-3"
                            onClick={() => setDiscountModalShow(true)}
                            onKeyDown={(e) => {
                            if (e.key === 'Enter') return;
                            }}
                        >
                            <TbShoppingBagDiscount /> &nbsp; Discount
                            {isManualDiscount ? (
                                <span className="absolute -top-2 -right-2">
                                    <FaCheckCircle className="text-theme_green text-xl" />
                                </span>
                            ) : null}
                        </button>
                    ) : null}
                    {orderNumber && orderData?.status != 'HOLD' && currentSlide <= 1 ? (
                        <Tippy content="Hold Order" placement="top">
                            <button type="button" className={`btn btn-outline-warning py-2 px-5`} disabled={false} onClick={handleOrderUpdateHold}>
                                <PiClockClockwiseFill className="mr-1" />
                                &nbsp;Hold
                            </button>
                        </Tippy>
                    ) : null}
                    {orderNumber && orderData?.status == 'HOLD' && currentSlide <= 1 ? (
                        <Tippy content="UnHold Order">
                            <button type="button" className={`btn btn-outline-warning py-2 px-5`} disabled={false} onClick={handleOrderUpdateUnHold}>
                                <PiClockClockwiseFill className="mr-1" />
                                &nbsp;UnHold
                            </button>
                        </Tippy>
                    ) : null}
                </div>
                {(!isIpadMode && currentSlide == 3) || (isIpadMode && currentSlide == 2) ? (
                    <div className="w-full flex justify-between items-end">
                        <div className="flex justify-start items-center">
                            {/* <button type="button" className={`btn btn-outline-primary py-2 px-5`} onClick={() => reactToPrintFn()}>
                                <FaPrint className="mr-1" />
                                &nbsp;Print
                            </button> */}
                            <div className="mx-1">
                                <ExitLabelPrint
                                    orderId={orderData?.id || 0}
                                    text="Print Exit Label"
                                    className="btn btn-outline-primary py-2 px-5 cursor-pointer"
                                    printButtonRef={exitLabelPrintButtonRef}
                                    onAfterPrint={handleAfterExitLabelPrint}
                                />
                            </div>
                            <div className="mx-1">
                                <ReceiptPrint
                                    isCompleteOrder={isCompleteOrder}
                                    orderId={orderData?.id || 0}
                                    text="Print Receipt"
                                    className="btn btn-outline-primary py-2 px-5 cursor-pointer"
                                    printButtonRef={receiptPrintButtonRef}
                                    onAfterPrint={handleAfterReceiptPrint}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="mx-1">
                                Cash Amount: ${orderData?.cashAmount}
                                {/* <span className="px-5">Other Amount: ${orderData?.otherAmount}</span> */}
                            </div>
                            <div className="mx-3">
                                {orderData?.orderType !== 'RETURN' ? (
                                    <div className="flex justify-between items-center text-xl text-dark dark:text-white-dark font-bold">
                                        Change Due:
                                        <p className="text-xl font-bold ml-2">
                                            ${orderData?.status == 'PAID' ? orderData?.changeDue && truncateToTwoDecimals(orderData?.changeDue) : truncateToTwoDecimals(changeDue)}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                className={`btn btn-outline-primary py-2 px-5 mr-2`}
                                onClick={() => {
                                    swiperRef.current.swiper.slideTo(0);
                                    setOrderNumber(0);
                                    setOrderId(0);
                                }}
                            >
                                <FaDiagramNext className="mr-1" />
                                &nbsp;Continue
                            </button>
                            {/* <button type="button" className={`btn btn-outline-primary py-2 px-5`}>
                                <FaPeopleGroup className={`shrink-0 group-hover:!text-primary mr-2}`} />
                                <Link href="/sales-queue" onClick={() => localStorage.setItem('activeItem',"queue")}>
                                    <div className="flex items-center ml-1">
                                        Customer Queue Page
                                    </div>
                                </Link>
                            </button> */}
                        </div>
                    </div>
                ) : null}
                <div id="slider">
                    <div className="flex justify-between items-center">
                        <Tippy content="Cancel Order">
                            <button
                                type="button"
                                className={`btn btn-outline-danger flex items-center mr-2 ${currentSlide != 0 || orderData?.status != 'EDIT' ? 'hidden' : 'block'}`}
                                // disabled={orderNumber === 0 || orderItemsList?.length == 0 || orderItemsList === undefined || orderData?.status == 'HOLD'}
                                onClick={() => {
                                    handleCancelOrder();
                                }}
                            >
                                <MdOutlineCancel className="text-lg mr-2" />
                                Cancel
                            </button>
                        </Tippy>
                        {orderData?.orderType == 'RETURN' ? (
                        <button
                            type="button"
                            className={`btn btn-primary flex items-center ${currentSlide != 0 ? 'hidden' : 'block'}`}
                            disabled={orderNumber === 0 || orderItemsList?.length == 0 || orderItemsList === undefined || orderData?.status == 'HOLD'}
                            onClick={() => {
                                swiperRef.current.swiper.slideTo(2);
                            }}
                        >
                            <TbTruckReturn className="mr-2" />
                            Return Order
                            <FaRegArrowAltCircleRight className="text-lg dark:text-gray-300 font-bold text-primary-light ml-2 " />
                        </button>
                        ) : (
                        <button
                            type="button"
                            className={`btn btn-primary flex items-center ${currentSlide != 0 ? 'hidden' : 'block'}`}
                            disabled={orderNumber === 0 || orderItemsList?.length == 0 || orderItemsList === undefined || orderData?.status == 'HOLD'}
                            onClick={() => {
                                    if (isIpadMode) swiperRef.current.swiper.slideTo(1);
                                else swiperRef.current.swiper.slideTo(2);
                            }}
                        >
                            <MdOutlineShoppingCartCheckout className="mr-2" />
                            Checkout
                            <FaRegArrowAltCircleRight className="text-lg dark:text-gray-300 font-bold text-primary-light ml-2 " />
                            </button>
                        )}
                        <button
                            type="button"
                            className={`group btn flex items-center mr-2 btn-outline-primary  ${(!isIpadMode && currentSlide == 2) || (isIpadMode && currentSlide == 1) ? 'block' : 'hidden'}`}
                            onClick={() => {
                                swiperRef.current.swiper.slideTo(0);
                            }}
                        >
                            <FaRegArrowAltCircleLeft className="text-lg font-bold text-[#4361ee] mr-2 group-hover:text-white" />
                            Modify Order
                            {/* <FaCartArrowDown className="text-lg font-bold text-[#4361ee] ml-2 group-hover:text-white" /> */}
                        </button>
                        <button
                            type="button"
                            className={`group btn flex items-center btn-outline-primary ${(!isIpadMode && currentSlide == 2) || (isIpadMode && currentSlide == 1) ? 'block' : 'hidden'}`}
                            disabled={
                                orderData?.orderType !== 'RETURN' && (subTotal == undefined || subTotal == 0 || payAmount + otherAmount < (subTotal || 0) - (discount || 0) - (loyaltySpend || 0))
                            }
                            onClick={orderData?.orderType == 'RETURN' ? handleOrderReturnComplete : completeOrderAlert}
                        >
                            {/* <FaClipboardCheck className="text-lg font-bold text-[#4361ee] mr-2 group-hover:text-white" /> */}
                            {orderData?.orderType == 'RETURN' ? 'Complete Return' : 'Complete Order'}
                            <FaRegArrowAltCircleRight className="text-lg font-bold text-[#4361ee] ml-2 group-hover:text-white" />
                        </button>
                        {/* <button
                            type="button"
                            className={`group btn btn-outline-success flex items-center ${currentSlide == 3 && orderData?.status != 'PAID' ? 'block' : 'hidden'}`}
                            onClick={() => {ff
                                swiperRef.current.swiper.slideTo(0);
                            }}
                        >
                            <FaRegCircleCheck className="text-lg font-bold mr-2 group-hover:text-white" />
                            Done
                        </button> */}
                    </div>
                </div>
            </div>
                            
            {/* Discount Modal */}
            <Transition appear show={discountModalShow} as={Fragment}>
                <Dialog as="div" open={discountModalShow} onClose={() => setDiscountModalShow(true)}>
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
                                <Dialog.Panel className="panel my-8 w-1/2 absolute top-[25%] m rounded-lg border-0 px-5 py-3 text-black dark:text-white-dark">
                                    <div className="flex justify-between items-center py-2 mb-2 border-b-[1px] border-gray-300 dark:border-[#191e3a]">
                                        Available Order Discounts and Loyalty Rewards
                                        <div onClick={() => setDiscountModalShow(false)} className="text-white-dark hover:text-dark dark:text-white-dark cursor-pointer">
                                            <IconX />
                                        </div>
                                    </div>
                                    <div className="rounded-lg flex flex-col justify-between items-center">
                                        <div className="w-full text-left font-bold">Discount</div>
                                        <div className="flex flex-wrap justify-start items-center py-3 w-full">
                                            {/* <div
                                                className={`max-w-3/12 px-5 hover:scale-105 ${isManualDiscount ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                onClick={() => {
                                                    if (orderData?.LoyaltyHistory && orderData?.LoyaltyHistory?.length > 0) {
                                                        warnAlert("You can't apply Loyalty and Discount reward for the same order.");
                                                        return;
                                                    }
                                                    if (!isManualDiscount) {
                                                        setSubDiscountModalShow(true);
                                                        setDiscountMethod('ByPercent');
                                                        setDiscountName('MANUAL');
                                                    }
                                                }}
                                            >
                                                <div
                                                    className={`relative flex flex-col items-center rounded-md py-3 px-10 text-white dark:text-gray-800 bg-primary`}
                                                >
                                                    <p className="text-lg">Manual Discount</p>
                                                    {isManualDiscount ? (
                                                        <div className="badge text-[8px] dark:text-warning-dark absolute -top-3 -right-3 bg-warning mx-auto rotate-[30deg] rounded-tl-lg">
                                                            Applied
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div> */}
                                            {discountData && discountData?.length > 0
                                                ? discountData?.map((item, index: any) => (
                                                    <div
                                                        key={index}
                                                        className={`max-w-3/12 px-5 hover:scale-105 ${isManualDiscount ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                        onClick={() => {
                                                            if (orderData?.LoyaltyHistory && orderData?.LoyaltyHistory?.length > 0) {
                                                                warnAlert("You can't apply Loyalty and Discount reward for the same order.");
                                                                return;
                                                            }
                                                            if (!isManualDiscount) {
                                                                setSubDiscountModalShow(true);
                                                                setDiscountMethod('ByPercent');
                                                                setDiscountName(item?.name || '');
                                                            }
                                                        }}
                                                    >
                                                        <div
                                                            className={`relative flex flex-col items-center rounded-md py-3 px-10 text-white dark:text-gray-800`}
                                                            style={{ backgroundColor: item?.color }}
                                                        >
                                                            <p className="text-lg">{item?.name}</p>
                                                            {/* <p className="text-center">{item?.discountPercent}%</p> */}
                                                              {isManualDiscount ? (
                                                                <div className="badge text-[8px] dark:text-warning-dark absolute -top-3 -right-3 bg-warning mx-auto rotate-[30deg] rounded-tl-lg">
                                                                    Applied
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                ))
                                                : null}
                                        </div>
                                        <div className="w-full text-left font-bold border-t-[1px] border-gray-300 dark:border-[#191e3a] mt-2 pt-2">Loyalty</div>
                                        <div className="flex flex-wrap justify-start items-center py-3 w-full">
                                            {/* <div className="max-w-3/12 px-5 hover:scale-105 cursor-pointer" onClick={() => {
                                                    if (isManualDiscount) {
                                                        warnAlert("You can't apply Loyalty and Discount reward for the same order.");
                                                        return;
                                                    }
                                                    if(orderData?.LoyaltyHistory && orderData?.LoyaltyHistory?.length > 0) {
                                                        // warnAlert("You can't apply Loyalty and Discount reward for the same order.");
                                                        return;
                                                    }
                                                    setShowLoyaltyModal(true);
                                                    setLoyaltyName("MANUAL");
                                                    setLoyaltyType('MANUAL');
                                                    setPointWorth(0.02);
                                                }}>
                                                <div className={`relative rounded-md py-3 px-10 text-white dark:text-gray-800 bg-secondary ${orderData?.LoyaltyHistory && orderData?.LoyaltyHistory?.length > 0 ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                                    <p className="text-lg">Manual Loyalty</p>
                                                    {orderData?.LoyaltyHistory && orderData?.LoyaltyHistory?.length > 0 ? (
                                                        <div className="badge text-[8px] dark:text-warning-dark absolute -top-3 -right-3 bg-warning mx-auto rotate-[30deg] rounded-tl-lg">
                                                            Applied
                                                        </div>
                                                    ) : null}
                                                </div>
                                                {}
                                            </div> */}
                                            {loyaltyData && loyaltyData?.length > 0
                                                ? loyaltyData?.map((item, index: any) => (
                                                      <div
                                                          key={index}
                                                          className="max-w-3/12 px-5 hover:scale-105 cursor-pointer"
                                                          onClick={() => {
                                                            if (isManualDiscount) {
                                                                warnAlert("You can't apply Loyalty and Discount reward for the same order.");
                                                                return;
                                                            }
                                                              if (orderData?.LoyaltyHistory && orderData?.LoyaltyHistory?.length > 0) {
                                                                // warnAlert("You can't apply Loyalty and Discount reward for the same order.");
                                                                return;
                                                            }
                                                            setShowLoyaltyModal(true);
                                                              setLoyaltyName(item?.name || '');
                                                            setLoyaltyType(item?.type || 'MANUAL');
                                                            setPointWorth(item?.pointWorth || 0);
                                                          }}
                                                      >
                                                          <div
                                                              className={`relative rounded-md py-3 px-10 text-white dark:text-gray-800 ${
                                                                  orderData?.LoyaltyHistory && orderData?.LoyaltyHistory?.length > 0 ? 'cursor-not-allowed' : 'cursor-pointer'
                                                              }`}
                                                              style={{ backgroundColor: item?.color }}
                                                          >
                                                            <p className="text-lg">{item?.name}</p>
                                                            {/* <p className="text-center">{item?.discountPercent}%</p> */}
                                                            {orderData?.LoyaltyHistory && orderData?.LoyaltyHistory?.length > 0 ? (
                                                                <div className="badge text-[8px] dark:text-warning-dark absolute -top-3 -right-3 bg-warning mx-auto rotate-[30deg] rounded-tl-lg">
                                                                    Applied
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                ))
                                                : null}
                                        </div>
                                        <div className="pt-2 w-full flex justify-end items-center border-t-[1px] border-gray-300 dark:border-[#191e3a]">
                                            <button type="button" className="btn btn-outline-secondary ltr:right-auto mr-2" onClick={() => setDiscountModalShow(false)}>
                                                Cancel
                                            </button>
                                            {/* <button type="button" className="btn btn-primary" onClick={}>
                                                Complete Void
                                            </button> */}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Discount sub Modal */}
            <Transition appear show={subDiscountModalShow} as={Fragment}>
                <Dialog as="div" open={subDiscountModalShow} onClose={() => setSubDiscountModalShow(true)}>
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
                                <Dialog.Panel className="my-8 absolute top-[25%] rounded-lg border-0 text-black dark:text-white-dark bg-white dark:bg-black">
                                    <div className="flex justify-between items-center py-2 px-5 mb-2 border-b-[1px] border-gray-300">
                                        Discount Setting
                                        <div onClick={() => setSubDiscountModalShow(false)} className="text-white-dark hover:text-dark dark:text-white-dark cursor-pointer">
                                            <IconX />
                                        </div>
                                    </div>
                                    <div className="pt-2 px-5">
                                        {/* <div className="flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light">
                                            <span className="ltr:pr-2 rtl:pl-2">
                                                <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong>Discount is not available now.
                                            </span>
                                            <button type="button" className="ltr:ml-auto rtl:mr-auto hover:opacity-80"></button>
                                        </div> */}
                                        <Tab.Group>
                                            <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${
                                                                selected ? '!border-secondary text-secondary !outline-none dark:!bg-[#191e3a]' : ''
                                                            } flex items-center border-t-2 border-transparent bg-[#f6f7f8] p-7 py-3 before:inline-block hover:border-secondary hover:text-secondary dark:bg-transparent dark:hover:bg-[#191e3a]`}
                                                            onClick={() => setDiscountMethod('ByPercent')}
                                                        >
                                                            % By Percent
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${
                                                                selected ? '!border-secondary text-secondary !outline-none dark:!bg-[#191e3a]' : ''
                                                            } flex items-center border-t-2 border-transparent bg-[#f6f7f8] p-7 py-3 before:inline-block hover:border-secondary hover:text-secondary dark:bg-transparent dark:hover:bg-[#191e3a]`}
                                                            onClick={() => setDiscountMethod('ByAmount')}
                                                        >
                                                            $ By Amount
                                                        </button>
                                                    )}
                                                </Tab>
                                                <Tab as={Fragment}>
                                                    {({ selected }) => (
                                                        <button
                                                            className={`${
                                                                selected ? '!border-secondary text-secondary !outline-none dark:!bg-[#191e3a]' : ''
                                                            } flex items-center border-t-2 border-transparent bg-[#f6f7f8] p-7 py-3 before:inline-block hover:border-secondary hover:text-secondary dark:bg-transparent dark:hover:bg-[#191e3a]`}
                                                            onClick={() => setDiscountMethod('ToAmount')}
                                                        >
                                                            $ To Amount
                                                        </button>
                                                    )}
                                                </Tab>
                                            </Tab.List>
                                            <Tab.Panels>
                                                <Tab.Panel>
                                                    <div className="active pt-3">
                                                        {/* Percentage Input */}
                                                        <div className="mb-6 flex justify-between items-center my-5 mx-auto px-2">
                                                            <label className="block">Percentage:</label>
                                                            <div className={`flex ${discountAmount == 0 ? 'has-error' : ''}`}>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    placeholder="Percentage"
                                                                    className={`form-input ltr:rounded-r-none rtl:rounded-l-none no-spinner`}
                                                                    value={discountAmount}
                                                                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                                                />
                                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                    %
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Totals */}
                                                        {/* <div className="mb-6 space-y-2 w-1/2 mx-auto">
                                                            <div className="flex justify-between">
                                                                <span>Current Total:</span>
                                                                <span>${currentTotal.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>New Total:</span>
                                                                <span>${calculateNewTotal()}</span>
                                                            </div>
                                                        </div> */}
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <div className="active pt-3">
                                                        {/* Percentage Input */}
                                                        <div className="mb-6 flex justify-between items-center my-5 mx-auto px-2">
                                                            <label className="block">Amount:</label>
                                                            <div className={`flex ${discountAmount == 0 || discountAmount < 0 ? 'has-error' : ''}`}>
                                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                    $
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    placeholder="Amount"
                                                                    className="form-input ltr:rounded-l-none rtl:rounded-r-none no-spinner"
                                                                    value={discountAmount}
                                                                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Totals */}
                                                        {/* <div className="mb-6 space-y-2 w-1/2 mx-auto">
                                                            <div className="flex justify-between">
                                                                <span>Current Total:</span>
                                                                <span>${currentTotal.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>New Total:</span>
                                                                <span>${calculateNewTotal()}</span>
                                                            </div>
                                                        </div> */}
                                                    </div>
                                                </Tab.Panel>
                                                <Tab.Panel>
                                                    <div className="active pt-3">
                                                        {/* Percentage Input */}
                                                        <div className="mb-6 flex justify-between items-center my-5 mx-auto px-2">
                                                            <label className="block">Amount:</label>
                                                            <div className={`flex ${discountAmount == 0 || discountAmount < 0 ? 'has-error' : ''}`}>
                                                                <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                                    $
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    placeholder="Amount"
                                                                    className="form-input ltr:rounded-l-none rtl:rounded-r-none no-spinner"
                                                                    value={discountAmount}
                                                                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Totals */}
                                                        {/* <div className="mb-6 space-y-2 w-1/2 mx-auto">
                                                            <div className="flex justify-between">
                                                                <span>Current Total:</span>
                                                                <span>${currentTotal.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>New Total:</span>
                                                                <span>${calculateNewTotal()}</span>
                                                            </div>
                                                        </div> */}
                                                    </div>
                                                </Tab.Panel>
                                            </Tab.Panels>
                                        </Tab.Group>
                                    </div>
                                    <div className="w-full max-w-md mx-auto text-black dark:text-white-dark bg-white dark:bg-black rounded-lg shadow-lg px-3 pb-3">
                                        <div className="flex justify-end items-center">
                                            <button className="btn btn-outline-secondary mr-2" onClick={() => setSubDiscountModalShow(false)}>
                                                Cancel
                                            </button>
                                            <button
                                                className="px-4 py-2 btn btn-primary"
                                                ref={addDiscountConfirmBtn}
                                                onClick={() => {
                                                    if (discountAmount > 0) {
                                                        setSubDiscountModalShow(false);
                                                        setDiscountModalShow(false);
                                                        handleSetDiscount();
                                                    }
                                                }}
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* Loyalty Modal */}
            <Transition appear show={showLoyaltyModal} as={Fragment}>
                <Dialog as="div" open={showLoyaltyModal} onClose={() => setShowLoyaltyModal(true)}>
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
                                <Dialog.Panel ref={loyaltyApplyConfirmButtonRef} className="my-8 absolute top-[25%] rounded-lg border-0 text-black dark:text-white-dark bg-white dark:bg-black">
                                    <div className="flex justify-between items-center py-2 px-5 mb-2 border-b-[1px] border-gray-300">
                                        Enter a new order total or points
                                        <div onClick={() => setSubDiscountModalShow(false)} className="text-white-dark hover:text-dark dark:text-white-dark cursor-pointer">
                                            <IconX />
                                        </div>
                                    </div>
                                    <div className="space-y-6 p-5">
                                        <div>
                                            {newOrderTotal > grandTotal ? (
                                        <div className="flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light mb-1">
                                            <span className="ltr:pr-2 rtl:pl-2">
                                                <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong> Input value is greater than grand total.
                                            </span>
                                            <button type="button" className="ltr:ml-auto rtl:mr-auto hover:opacity-80">
                                            {/* <IconX className="w-5 h-5" /> */}
                                            </button>
                                                </div>
                                            ) : null}
                                            {newOrderTotal < 0 ? (
                                        <div className="flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light mb-1">
                                            <span className="ltr:pr-2 rtl:pl-2">
                                                <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong> Input value mustn't to be minus value.
                                            </span>
                                            <button type="button" className="ltr:ml-auto rtl:mr-auto hover:opacity-80">
                                            {/* <IconX className="w-5 h-5" /> */}
                                            </button>
                                                </div>
                                            ) : null}
                                            {pointsToSpend > (orderData?.customer?.loyaltyPoints || 0) ? (
                                        <div className="flex items-center p-3.5 rounded text-warning bg-warning-light dark:bg-warning-dark-light">
                                            <span className="ltr:pr-2 rtl:pl-2">
                                                <strong className="ltr:mr-1 rtl:ml-1">Warning!</strong> Total points should be less than customer's points.
                                            </span>
                                            <button type="button" className="ltr:ml-auto rtl:mr-auto hover:opacity-80">
                                            {/* <IconX className="w-5 h-5" /> */}
                                            </button>
                                                </div>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-dark dark:text-white-dark mb-1">
                                                    New Order Total <span className="text-red-500">*</span>
                                                </label>
                                                <div className={`flex ${newOrderTotal < 0 ? 'has-error' : ''}`}>
                                                    <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                                        $
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="auto"
                                                        placeholder="Amount"
                                                        className="form-input ltr:rounded-l-none rtl:rounded-r-none no-spinner"
                                                        value={newOrderTotal}
                                                        onChange={(e) => {
                                                            if (Number(e.target.value) > grandTotal) {
                                                                setNewOrderTotal(Number(truncateToTwoDecimals(grandTotal)));
                                                                setPointsToSpend(setFourDecimals((grandTotal - Number(grandTotal)) / pointWorth));
                                                            } else {
                                                                setNewOrderTotal(Number(truncateToTwoDecimals(Number(e.target.value))));
                                                                setPointsToSpend(setFourDecimals((grandTotal - Number(e.target.value)) / pointWorth));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <span className="text-dark dark:text-white-dark font-medium">OR</span>
                                            </div>

                                            <div className={`flex-1 ${pointsToSpend > (orderData?.customer?.loyaltyPoints || 0) ? 'has-error' : ''}`}>
                                                <label className="block text-sm font-medium text-dark dark:text-white-dark mb-1">
                                                    Points to Spend <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={pointsToSpend}
                                                    onChange={(e) => {
                                                        if (Number(e.target.value) > (orderData?.customer?.loyaltyPoints || 0)) {
                                                            setPointsToSpend(Number(truncateToTwoDecimals(orderData?.customer?.loyaltyPoints)));
                                                            setNewOrderTotal(setFourDecimals(grandTotal - Number(orderData?.customer?.loyaltyPoints || 0) * pointWorth));
                                                        } else {
                                                            setPointsToSpend(Number(truncateToTwoDecimals(Number(e.target.value))));
                                                            setNewOrderTotal(setFourDecimals(grandTotal - Number(e.target.value) * pointWorth));
                                                        }
                                                    }}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <div>
                                                Order Total: <span className="font-medium">${truncateToTwoDecimals(grandTotal)}</span>
                                            </div>
                                            <div>
                                                Spendable Points:{' '}
                                                <span className="font-medium">{(orderData?.customer?.loyaltyPoints && truncateToTwoDecimals(orderData?.customer?.loyaltyPoints)) || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full mx-auto text-black dark:text-white-dark bg-white dark:bg-black rounded-lg shadow-lg px-5 pb-3">
                                        <div className="flex justify-end items-center">
                                            <button className="btn btn-outline-secondary mr-2" onClick={() => setShowLoyaltyModal(false)}>
                                                Cancel
                                            </button>
                                            <button
                                                className="px-4 py-2 btn btn-primary"
                                                onClick={() => {
                                                    if (newOrderTotal > 0 && newOrderTotal < grandTotal && pointsToSpend > 0 && pointsToSpend < (orderData?.customer?.loyaltyPoints || 0)) {
                                                        setShowLoyaltyModal(false);
                                                        setDiscountModalShow(false);
                                                        handleSetLoyalty();
                                                    }
                                                }}
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* Return Item Modal */}
            <Transition appear show={showCancelOrderItemModal} as={Fragment}>
                <Dialog as="div" open={showCancelOrderItemModal} onClose={() => setShowCancelOrderItemModal(true)}>
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
                                <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-4 py-2">
                                        <div className="flex items-center text-lg font-bold">
                                            {/* <FaCashRegister className="mr-3 text-dark dark:text-white-dark" /> */}
                                            Return Amount
                                        </div>
                                        <button type="button" className="text-dark hover:text-dark dark:text-white-dark" onClick={() => setShowCancelOrderItemModal(false)}>
                                            <RxCross1 />
                                        </button>
                                    </div>
                                    <hr />
                                    <div className="p-5">
                                        <div className="w-full flex justify-between items-center py-2">
                                            <div className="text-left text-base mr-3 text-nowrap">
                                                Amount
                                                <span className="text-sm text-red-500 ml-2">*</span>
                                            </div>

                                            <div className={`w-full flex ${returnOrderAmount ? '' : 'has-error'}`}>
                                                {/* <div
                                                    className={`bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b] ${
                                                        true ? 'has-error' : ''}
                                                    `}
                                                >
                                                    $
                                                </div> */}
                                                <input
                                                    type="text"
                                                    name="amount"
                                                    placeholder="Itme Count"
                                                    className="w-full form-input"
                                                    onChange={(e) => setReturnOrderAmount(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-secondary mr-2" onClick={() => setShowCancelOrderItemModal(false)}>
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary ltr:ml-2 rtl:mr-2"
                                                onClick={() => {
                                                    if (returnOrderAmount) {
                                                        handleCreateOrderForReturn(cancelOrderItemId, returnOrderAmount);
                                                        setShowCancelOrderItemModal(false);
                                                    }
                                                }}
                                            >
                                                Return Item
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* <Transition appear show={itemNumSetModal} as={Fragment}>
                <Dialog as="div" open={itemNumSetModal} onClose={() => setItemNumSetModal(true)}>
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
                                <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden my-8 w-full max-w-lg text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-4 py-2">
                                        <div className="flex items-center text-lg font-bold">
                                            Item Amount
                                        </div>
                                        <button type="button" className="text-dark hover:text-dark dark:text-white-dark" onClick={() => setItemNumSetModal(false)}>
                                            <RxCross1 />
                                        </button>
                                    </div>
                                    <hr />
                                    <div className="p-5">
                                        <div className="w-full flex justify-between items-center py-2">
                                            <div className="text-left text-base mr-3 text-nowrap">
                                                Amount
                                                <span className="text-sm text-red-500 ml-2">*</span>
                                            </div>

                                            <div className={`w-full flex ${orderItemNum ? '' : 'has-error'}`}>
                                               
                                                <input
                                                    type="text"
                                                    name="amount"
                                                    value={orderItemNum}
                                                    placeholder="Itme Count"
                                                    className="w-full form-input"
                                                    onChange={(e) => setOrderItemNum(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end items-center mt-8">
                                            <button type="button" className="btn btn-outline-secondary mr-2" onClick={() => setItemNumSetModal(false)}>
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary ltr:ml-2 rtl:mr-2"
                                                onClick={() => {
                                                    if (orderItemNum) {
                                                        handleCreateOrderItem(orderItemData.productId, orderItemNum, orderItemData.price, packageLabel);
                                                        setItemNumSetModal(false);
                                                    }
                                                }}
                                            >
                                                Add Items
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition> */}
            <div className="hidden">
                <div ref={contentRef} className="w-full absolute -top-0 -z-[100] p-3">
                    <div className="flex flex-col justify-between items-start p-3">
                        <div className="font-bold text-nowrap">Store: #{'Store'}</div>
                        <div className="font-bold text-nowrap">Order: #{orderNumber != 0 ? orderNumber : ''}</div>
                        <div className="font-bold text-nowrap">Loyalty Point Earned: {0}</div>
                        <div className="font-bold text-nowrap">Total Loyalty Point: {0}</div>
                        <div className="w-full border-y-[1px] py-1 my-2">
                            {orderItemsList?.map((item: any, index: any) => (
                                <div key={index} className="flex justify-between items-center my-1">
                                    {/* <td>
                                                <ProductCategory
                                                    name={item?.package?.itemProductCategoryName}
                                                    color="#343245"
                                                />
                                            </td> */}
                                    <p className="font-bold">{item?.product?.name}</p>
                                    {/* <td className="ltr:text-right rtl:text-left">${item?.product?.price}</td>
                                            <td className="ltr:text-right rtl:text-left">{item?.quantity}</td> */}
                                    <p className="ltr:text-right rtl:text-left">${multiplyResult(item?.product?.price || 1, item?.quantity || 0)}</p>
                                    {/* <td className="text-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-warning p-1"
                                                    onClick={() => {
                                                        deleteAlert(item?.id || '');
                                                    }}
                                                    disabled={isDeleteOrderItemButtonDisabled || showCheckOut}
                                                >
                                                    <MdOutlineClear />
                                                </button>
                                            </td> */}
                                </div>
                            ))}
                        </div>
                        <div className="w-full flex flex-col justify-between items-end">
                            <p className="text-nowrap">SubTotal: ${truncateToTwoDecimals((orderData?.cashAmount || 0) + (orderData?.otherAmount || 0) - (orderData?.changeDue || 0))}</p>
                            <p className="text-nowrap">DisCount: ${truncateToTwoDecimals(orderData?.discount)}</p>
                            <p className="text-nowrap mb-2">Tax (Included): ${truncateToTwoDecimals(tax)}</p>
                            <p className="text-nowrap mb-2 font-bold">Total: ${truncateToTwoDecimals((orderData?.cashAmount || 0) + (orderData?.otherAmount || 0) - (orderData?.changeDue || 0))}</p>
                            <p className="text-nowrap mb-2">Cash: ${truncateToTwoDecimals(orderData?.cashAmount)}</p>
                            <p className="text-nowrap mb-2">Other: ${truncateToTwoDecimals(orderData?.otherAmount)}</p>
                            <p className="text-nowrap mb-2">Change: ${truncateToTwoDecimals(orderData?.changeDue)}</p>
                            {/* orderData?.status == 'PAID' ? (orderData?.cashAmount || 0) + (orderData.otherAmount || 0) - (orderData?.changeDue || 0) */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cashier;
