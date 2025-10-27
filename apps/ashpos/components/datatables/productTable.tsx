'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { createStyles } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAtom } from 'jotai';

import {
    useDeleteProductMutation,
    useAllProductsByDispensaryIdQuery,
    useAllItemCategoriesByDispensaryIdQuery,
    useProductQuery,
    usePackagesByConnectedProductIdQuery,
    useAllProductsByDispensaryIdWithPagesQuery
} from '@/src/__generated__/operations';
import ProductRegisterModal from '../modals/productRegisterModal';
import { useQueryClient } from '@tanstack/react-query';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns } from 'react-icons/bs';
import IconPlus from '@/components/icon/icon-plus';
import IconPencil from '@/components/icon/icon-pencil';
import IconTrashLines from '@/components/icon/icon-trash-lines';

import ProductCategory from '../etc/productCategory';

import Swal from 'sweetalert2';
import warnAlert from '../notification/warnAlert';
import successAlert from '../notification/successAlert';
import { userDataSave } from '@/store/userData';
import { DeepPartial } from '@/store/deepPartialType';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import * as generatedTypes from '@/src/__generated__/operations';
import ExportTable from '../etc/exportTable';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import { IoSearch } from 'react-icons/io5';
import { TbListDetails } from 'react-icons/tb';
import ProductCard from '../etc/productCard';
import { convertPSTTimestampToTimezone } from '@/utils/datetime';
import RefreshButton from '../etc/refreshButton';
import CustomSelect from '../etc/customeSelect';
import TableLoading from '../etc/tableLoading';
import LoadingSkeleton from '../etc/loadingSkeleton';
import { useDebouncedCallback } from 'use-debounce';
import {syncStatusAtom} from "@/store/syncStatusAtom";

type RowDataType = generatedTypes.Product;
type RowData = RowDataType[];

const ProductTable = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);

    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    const queryClient = useQueryClient();

    const { userData } = userDataSave();
    const userId = userData.userId;
    const [isShowFinishedPackage, setIsShowFinishedPackage] = useState(false);
    const [productId, setProductId] = useState('');
    const dispensaryId = userData.dispensaryId;
    const [categoryTypeId, setCategoryTypeId] = useState("")
    const [howStock, setHowStock] = useState("all")

    const [customOptions, setCustomOptions] = useState<any>([])
    const [currentCategory, setCurrentCategory] = useState("")

    // Theme style
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const darkMode = useSelector((state: IRootState) => state.themeConfig.isDarkMode);
    const menu = useSelector((state: IRootState) => state.themeConfig.menu);
    const sidebar = useSelector((state: IRootState) => state.themeConfig.sidebar)

    // Data fetch
    const allItemCategoriesByDispensaryId = useAllItemCategoriesByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const itemCategories = allItemCategoriesByDispensaryId.data?.allItemCategoriesByDispensaryId;
    
    const deleteProductMutation = useDeleteProductMutation();
    const allProductsByDispensaryId = useAllProductsByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const allProductData = allProductsByDispensaryId.data?.allProductsByDispensaryId;
    
    const productRowDataById = useProductQuery({ id: productId });
    const productDataById = productRowDataById.data?.product;
    const packageRowData = usePackagesByConnectedProductIdQuery({ productId: productId });
    const packageData = packageRowData.data?.packagesByConnectedProductId;
    
    // for the pagination
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    //// @ts-expect-error

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    
    const [searchSelectValue, setSearchSelectValue] = useState('name');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('name');
    const [searchParam, setSearchParam] = useState('');
    const [searchPage, setSearchPage] = useState(1);

    const productDataByDispensaryIdWithPage = useAllProductsByDispensaryIdWithPagesQuery({
        dispensaryId: dispensaryId,
        pageNumber: searchPage,
        onePageRecords: pageSize,
        searchField: searchField,
        searchParam: searchParam,
        categoryType: categoryTypeId,
        howStock: howStock,
        sortField: sortStatus.columnAccessor,
        sortDirection: sortStatus.direction,
    });



    const productData = productDataByDispensaryIdWithPage.data?.allProductsByDispensaryIdWithPages?.products;
    const totalCount = productDataByDispensaryIdWithPage.data?.allProductsByDispensaryIdWithPages?.totalCount;
    const [isAtTop, setIsAtTop] = useState(false);
    const [isRightBarShow, setIsRightBarShow] = useState(false);
    const [firstViewed, setFirstViewed] = useState(false);
    const [selectedRow, setSelectedRow] = useState(0);
    const targetRef = useRef<HTMLTableElement | null>(null);

    const [hideCols, setHideCols] = useState<any>(['createdAt', 'updatedAt', 'dispensary.name', 'sku', 'upc', 'user.name', 'user.email', 'user.phone', 'supplier.email', 'supplier.phone', 'metrcPackage']);
    const cols = [
        { accessor: 'itemCategory.name', title: 'Category' },
        { accessor: 'name', title: 'Name' },
        { accessor: 'sku', title: 'SKU' },
        { accessor: 'upc', title: 'UPC' },
        { accessor: 'price', title: 'Price' },
        // { accessor: 'unitOfMeasure', title: 'Unit Weight of Measure' },
        { accessor: 'posQtySum', title: 'Quantity' },
        { accessor: 'unitWeight', title: 'Unit Weight' },
        { accessor: 'netWeight', title: 'Net Weight' },
        // { accessor: 'metrcPackageLabel', title: 'Metrc Package' },
        // { accessor: 'dispensary.name', title: 'Dispensary' },
        // { accessor: 'user.name', title: 'User Name' },
        // { accessor: 'user.email', title: 'User Email' },
        // { accessor: 'user.phone', title: 'User Phone' },
        { accessor: 'supplier.name', title: 'Supplier Name' },
        // { accessor: 'supplier.email', title: 'Supplier Email' },
        // { accessor: 'supplier.phone', title: 'Supplier Phone' },
        { accessor: 'createdAt', title: 'Created At' },
        // { accessor: 'updatedAt', title: 'Updated At' },
    ];

    const [modalShow, setModalShow] = useState(false);
    const [modalMode, setModalMode] = useState('new');

    const [currentProduct, setCurrentProduct] = useState<DeepPartial<RowDataType>>({
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

    useEffect(() => {
        if(syncStatus) {
            productDataByDispensaryIdWithPage.refetch();
            productRowDataById.refetch();
            packageRowData.refetch();
        }
    }, [syncStatus])
    // get the last segment of the URL path
    useEffect(() => {
        console.log("Last segment of URL path:", lastSegment);
        // Do something with lastSegment
    }, [lastSegment]);

    useEffect(() => {
        let categoryOption: any[] = [];
        itemCategories?.map((item) => {
            categoryOption.push({ value: item?.id, label: item?.name });
        });
        setCustomOptions(categoryOption);
    }, [itemCategories]);

    useEffect(() => {
        if(searchParams.get('productId')) {
            setProductId(searchParams.get('productId') as string);

            setIsRightBarShow(true)
        }
    }, [searchParams])

    const handleSearch = () => {
        setSearchField(searchSelectValue);
        setSearchParam(searchValue.trim());
        setSearchPage(1);
    };

    const handleRealtimeSearch = useDebouncedCallback((param) => {
        setSearchField(searchSelectValue);
        setSearchParam(param.trim());
        setSearchPage(1);
    }, 500);

    useEffect(() => {
        setSearchPage(page);
    }, [page]);

    const handleDeleteProduct = async (id: string, name: string) => {
        await deleteProductMutation.mutate(
            {
                id: id,
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    // const refetch = async () => {
                    //     return await queryClient.refetchQueries(['AllProductsByDispensaryId']);
                    // };
                    // refetch();
                    productDataByDispensaryIdWithPage.refetch();
                    Swal.fire({ title: 'Deleted!', text: name + ' has been deleted.', icon: 'success', customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white' });
                },
                onSettled() {},
            }
        );
    };

    const deleteAlert = async (id: string, name: string) => {
        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            padding: '2em',
            customClass: 'sweet-alerts dark:bg-[#1b2e4b] dark:text-white',
        }).then((result) => {
            if (result.value) {
                handleDeleteProduct(id, name);
            } else {
            }
        });
    };

    useEffect(() => {
        setPage(1);
        if (pageSize == 10) setIsAtTop(false);
    }, [pageSize]);

    // useEffect(() => {
    //     const from = (page - 1) * pageSize;
    //     const to = from + pageSize;
    //     if (initialRecords) setRecordsData([...initialRecords.slice(from, to)]);
    // }, [page, pageSize, initialRecords]);

    // useEffect(() => {
    //     if (productData) {
    //         //@ts-expect-error
    //         // setInitialRecords(() => {
    //         //     return productData?.filter((item) => {
    //         //         return (
    //         //             item?.dispensary?.name?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.user?.phone?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.supplier?.name?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.supplier?.email?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.supplier?.phone?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.itemCategory?.name?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.name?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.sku?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.upc?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.price?.toString().includes(search.toLowerCase()) ||
    //         //             item?.unitOfMeasure?.toLowerCase().includes(search.toLowerCase()) ||
    //         //             item?.unitWeight?.toString().includes(search.toLowerCase()) ||
    //         //             item?.createdAt.toString().includes(search.toLowerCase()) ||
    //         //             item?.updatedAt.toString().includes(search.toLowerCase())
    //         //         );
    //         //     });
    //         // });
    //     }
    // }, [search, productData]);
    // useEffect(() => {
    //     const data = sortBy(initialRecords, sortStatus.columnAccessor);
    //     setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    //     setPage(1);
    // }, [sortStatus]);

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };

    const handleNewProduct = () => {
        setModalMode('new');
        setModalShow(true);
        setCurrentProduct({
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
    };
   

    const updateSearchParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(key, value)
        router.push(`?${params.toString()}`) // or use replace() to avoid history stacking
    }

    const handleRowClick = (record : any, index : any) => {
        setProductId(record? record.id : "");
        setSelectedRow(index);
        updateSearchParams('productId', record?.id);
    }

    // for full width tabel
    const checkPositionWindow = () => {
        setFirstViewed(false);
        if (targetRef.current) {
            const dataTable = targetRef.current.getElementsByClassName('data-table');
            const rect = dataTable[0].getBoundingClientRect();
            // Check if the top of the element is at or near zero
            if (rect.top <= 50) {
                setIsAtTop(true);
            } else if (rect.top <= -10) {
                setIsAtTop(false);
            }
        }
    };

    const checkPositionTable = (event: any) => {
        if (targetRef.current) {
            const tbody = targetRef.current.querySelector('tbody');
            const tr = tbody && tbody.querySelectorAll('tr')?.[0];
            if (tr) {
                const rect = tr.getBoundingClientRect();
                if (rect.top <= 100) {
                    if (event.deltaY < 0 && rect.top >= 0 && rect.top <= 100) {
                        setIsAtTop(false);
                    }
                    if (firstViewed) {
                        setIsAtTop(false);
                        setFirstViewed(false);
                    }
                } else {
                    setFirstViewed(true);
                }
            }
        }
    };

    const handleUpdateCustomer = (id: any) => {
        setCategoryTypeId(id);
        
        const matched = customOptions.find((item: any) => item.value === id);
        const name = matched?.label || '';
    
        setCurrentCategory(name);
    };

    useEffect(() => {
        window.addEventListener('scroll', checkPositionWindow);
        return () => {
            window.removeEventListener('scroll', checkPositionWindow);
        };
    }, [firstViewed]);

    useEffect(() => {
        if (targetRef.current) {
            const dataTable = targetRef.current.getElementsByClassName('mantine-ScrollArea-viewport');
            dataTable[0].addEventListener('scroll', checkPositionTable);
            dataTable[0].addEventListener('wheel', checkPositionTable);

            return () => {
                dataTable[0].removeEventListener('scroll', checkPositionTable);
                dataTable[0].removeEventListener('wheel', checkPositionTable);
            };
        }
    }, [firstViewed]);

    useEffect(() => {
        if (targetRef.current) {
            const rows = targetRef.current.querySelectorAll('tr');

            if (rows.length > 0) {
                for (let i = 0; i < rows.length; i++) {
                    rows[i].classList.remove('active');
                    rows[i].classList.remove('dark-active');
                }
                const row = rows[selectedRow + 1];
                if (darkMode) row?.classList.add('dark-active');
                else row.classList.add('active');
            }
        }
    }, [selectedRow, darkMode]);

    const [tableClassname, setTableClassName] = useState('w-full');

    useEffect(() => {
        if (isAtTop) {
            // Add your logic here based on rightBarStatus
            if (isRightBarShow === true) {
                setTableClassName(`fixed top-0 z-[99]  ${menu == "horizontal" ? "left-0 w-[calc(100vw-500px)]" : menu == "vertical" ? sidebar == true ? 'left-[0px] w-[calc(100vw-505px)]' : "left-[280px] w-[calc(100vw-780px)]" : "left-[90px] w-[calc(100vw-590px)]"} -translate-x-[20px] h-[100vh] bounceInUp1 duration-500`);
            } else {
                setTableClassName(`fixed top-0 z-[99] ${menu == "horizontal" ? "left-0 w-[calc(100vw)]" : menu == "vertical" ? sidebar == true ? 'left-[0px] w-[calc(100vw-5px)]' : "left-[280px] w-[calc(100vw-280px)]" : "left-[90px] w-[calc(100vw-90px)]"} -translate-x-[20px] h-[100vh] bounceInUp1 duration-500`);
            }
        } else {
            if (isRightBarShow === true) {
                setTableClassName(`${menu == "horizontal" ? "w-[calc(100vw-560px)]" : menu == "vertical" ? sidebar == true ? 'w-[calc(100vw-550px)]' : "w-[calc(100vw-810px)]" : "w-[calc(100vw-620px)]"} duration-500 bounceInDown1`);
            } else {
                setTableClassName(`${menu == "horizontal" ? "w-[calc(100vw-90px)]" : menu == "vertical" ? sidebar == true ? 'w-[calc(100vw-85px)]' : "w-[calc(100vw-350px)]" : "w-[calc(100vw-160px)]"} duration-500 bounceInDown1`);
            }
        }
    }, [isAtTop, isRightBarShow, sidebar, menu]);

    return (
        <div className={`panel mt-3 pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center !mb-3">
                <h5 className="text-lg font-semibold dark:text-white-dark">Products</h5>
                <div className='flex justify-start items-center ml-5 w-44'>
                {/* <select
                    onChange={(e) => {
                        setHowStock(e.target.value);
                    }}
                    id="currentDispensary"
                    className="flex-initial w-32 form-select text-dark dark:text-white-dark"
                >
                    <option value="" disabled={true}>
                        Inventory
                    </option>
                    <option className="text-dark dark:text-white-dark" value="all">
                        All Products
                    </option>
                    <option className="text-dark dark:text-white-dark" value="has">
                        Has Stock
                    </option>
                    <option className="text-dark dark:text-white-dark" value="no">
                        No Stock
                    </option>
                    <option className="text-dark dark:text-white-dark" value="low">
                        Low Stock
                    </option>
                    <option className="text-dark dark:text-white-dark" value="negative">
                        Negative Stock
                    </option>
                </select> */}
                {/* <select onChange={(e) => {
                        setCategoryTypeId(e.target.value);
                    }}
                    id="currentDispensary"
                    className="flex-initial w-36 form-select text-dark dark:text-white-dark ml-3">
                    <option value="" disabled={true}>
                        Category Type
                    </option>
                    <option value="">All Categories</option>
                    {itemCategories?.map((item, index) => 
                     <option value={item?.id}>{item?.name}</option> 
                    )}
                </select> */}
                <CustomSelect
                    options={customOptions}
                    onChange={handleUpdateCustomer}
                    currentOption={currentCategory}
                    setModalShow={setModalShow}
                    showingText='All Categories'
                    disabled={false}
                    showingSearch={false}
                />
                </div>
                <div className={`absolute lg:flex items-center gap-2 lg:ltr:ml-auto rtl:mr-auto transition-all duration-500 ${isRightBarShow? "!right-[502px]" :"right-8"}`}>
                    <div>
                        <button type="button" onClick={handleNewProduct} className="btn btn-primary flex justify-between items-center rounded-full py-1.5 px-3 !text-sm">
                            <IconPlus className="h-5 w-5 shrink-0 ltr:mr-1 rtl:ml-1" />
                            New
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <RefreshButton onClick={() => productDataByDispensaryIdWithPage.refetch()}/>
                        <Tippy content="Columns" placement="top">
                            <div className="dropdown">
                                <Dropdown
                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                    btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                    button={
                                        <>
                                            {/* <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                        <IconCaretDown className="h-5 w-5" /> */}
                                            <BsColumns className="text-xl" />
                                        </>
                                    }
                                >
                                    <ul className="!min-w-[240px]">
                                        {cols.map((col, i) => {
                                            return (
                                                <li
                                                    key={i}
                                                    className="flex flex-col"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <div className="flex items-center px-4 py-1">
                                                        <label className="mb-0 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!hideCols.includes(col.accessor)}
                                                                className="form-checkbox"
                                                                value={col.accessor}
                                                                onChange={(event: any) => {
                                                                    setHideCols(event.target.value);
                                                                    showHideColumns(col.accessor, event.target.checked);
                                                                }}
                                                            />
                                                            <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                        </label>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Dropdown>
                            </div>
                        </Tippy>
                        <ExportTable cols={cols} recordsData={allProductData} hideCols={hideCols} filename='product_table_data'/>
                        
                    </div>
                    <div className="text-right flex justify-start items-center">
                        <select
                            onChange={(e) => {
                                setSearchSelectValue(e.target.value);
                                setSearchPage(1)
                            }}
                            id="currentDispensary"
                            className="flex-initial w-44 form-select text-white-dark rounded-r-none"
                        >
                            {/* <option value='packageLabel'>packageLabel</option> */}
                            <option value="name">Product Name</option>
                            <option value="supplier.name">Supplier Name</option>
                            {/* <option value='packageId'>packageId</option> */}
                        </select>
                        <input type="text" className="form-input !rounded-none w-44" placeholder="Search..." value={searchValue} onChange={(e) => {
                            setSearchValue(e.target.value);
                            handleRealtimeSearch(e.target.value);
                        }} />
                        <button
                            onClick={handleSearch}
                            className="bg-[#eee] flex justify-center items-center ltr:rounded-r-md rtl:rounded-l-md px-3 py-3  font-semibold border ltr:border-l-0 rtl:border-r-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]"
                        >
                            <IoSearch />
                        </button>
                    </div>
                    {/* <div className="text-right">
                        <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div> */}

                    {/* <div className="flex flex-wrap items-center">
                    <button type="button" onClick={() => exportTable('csv')} className="btn btn-primary btn-sm m-1 ">
                        <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        CSV
                    </button>
                    <button type="button" onClick={() => exportTable('txt')} className="btn btn-primary btn-sm m-1">
                        <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        TXT
                    </button>
                    <button type="button" onClick={() => exportTable('xls')} className="btn btn-primary btn-sm m-1">
                        <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        Excel
                    </button>
                </div> */}
                </div>
            </div>
            <div className="datatables !relative w-full">
                <div className={`transition-transform duration-300`} ref={targetRef}>
                    <DataTable
                        highlightOnHover
                        className={`table-hover whitespace-nowrap data-table ${tableClassname}`}
                        records={productData ?? []}
                        fetching={productDataByDispensaryIdWithPage.isLoading || productDataByDispensaryIdWithPage.isFetching}
                        columns={[
                            {
                                accessor: 'index',
                                title: '#',
                                width: 40,
                                render: (record) => (productData ? (page-1) * pageSize + productData.indexOf(record) + 1 : 0),
                            },
                            {
                                accessor: 'id',
                                title: 'ID',
                                sortable: true,
                                hidden: true,
                            },
                            {
                                accessor: 'itemCategory.name',
                                title: 'Category',
                                sortable: true,
                                hidden: hideCols.includes('itemCategory.name'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { itemCategory } = row;

                                    if (itemCategory === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <ProductCategory name={itemCategory.name} color={itemCategory.color} />},
                            },
                            {
                                accessor: 'name',
                                title: 'Name',
                                sortable: true,
                                hidden: hideCols.includes('name'),
                            },
                            {
                                accessor: 'sku',
                                title: 'SKU',
                                sortable: true,
                                hidden: hideCols.includes('sku'),
                            },
                            {
                                accessor: 'upc',
                                title: 'UPC',
                                sortable: true,
                                hidden: hideCols.includes('upc'),
                            },
                            {
                                accessor: 'price',
                                title: 'Price',
                                sortable: true,
                                hidden: hideCols.includes('price'),
                                render: (row) => 
                                    {
                                        if (!row) {
                                            return null; // Handle the null case as needed
                                        }
                                        const { price } = row;
    
                                        if (price === null) {
                                            return null; // Handle null case if necessary
                                        }
                                
                                return <div className="flex justify-end items-center slashed-zero">${price}</div>
                                }
                            },
                            
                            // {
                            //     accessor: 'unitOfMeasure',
                            //     title: 'Unit',
                            //     sortable: true,
                            //     hidden: hideCols.includes('unitOfMeasure'),
                            // },
                            {
                                accessor: 'posQtySum',
                                title: 'Quantity',
                                sortable: true,
                                hidden: hideCols.includes('unitOfMeasure'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { posQtySum, productUnitOfMeasure, isApplyUnitWeight, unitOfUnitWeight } = row;
    
                                    // if (!AssignPackage || !unitOfMeasure) {
                                    //     return null; // Handle null case if necessary
                                    // }
                                    
                                    // // Safely access first element if it exists and is not null
                                    // const firstPackage = Array.isArray(AssignPackage) && AssignPackage.length > 0 ? AssignPackage[0] : null;
                                    
                                    // if (!firstPackage || firstPackage.posQty === undefined) {
                                    //     return null;
                                    // }
                                    
                                    return <div className="flex justify-end items-center slashed-zero">{posQtySum + " " + productUnitOfMeasure   == 'ea'  && isApplyUnitWeight
&& unitOfUnitWeight != null ? unitOfUnitWeight : productUnitOfMeasure}</div>;
                                }
                            },
                            {
                                accessor: 'unitWeight',
                                title: 'Unit Weight',
                                sortable: true,
                                hidden: hideCols.includes('unitWeight'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { unitWeight, unitOfUnitWeight, isApplyUnitWeight } = row;
    
                                    // if (!AssignPackage || !unitOfMeasure) {
                                    //     return null; // Handle null case if necessary
                                    // }
                                    
                                    // // Safely access first element if it exists and is not null
                                    // const firstPackage = Array.isArray(AssignPackage) && AssignPackage.length > 0 ? AssignPackage[0] : null;
                                    
                                    // if (!firstPackage || firstPackage.posQty === undefined) {
                                    //     return null;
                                    // }
                                    
                                    return <div className="flex items-center justify-end slashed-zero">
                                        {isApplyUnitWeight ? <span className="badge badge-outline-primary rounded-full mr-2">Applied</span> : null}
                                        {unitWeight + (unitOfUnitWeight || '')}
                                    </div>;
                                }
                            },
                            {
                                accessor: 'netWeight',
                                title: 'Net Weight',
                                sortable: true,
                                hidden: hideCols.includes('netWeight'),
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { netWeight, unitOfNetWeight } = row;
    
                                    // if (!AssignPackage || !unitOfMeasure) {
                                    //     return null; // Handle null case if necessary
                                    // }
                                    
                                    // // Safely access first element if it exists and is not null
                                    // const firstPackage = Array.isArray(AssignPackage) && AssignPackage.length > 0 ? AssignPackage[0] : null;
                                    
                                    // if (!firstPackage || firstPackage.posQty === undefined) {
                                    //     return null;
                                    // }
                                    
                                    return <div className="flex items-center justify-end slashed-zero">{netWeight + (unitOfNetWeight || '')}</div>;
                                }
                            },
                            {
                                accessor: 'metrcPackage',
                                title: 'Metrc Package',
                                sortable: true,
                                hidden: hideCols.includes('metrcPackage'),
                            },
                            {
                                accessor: 'dispensary.name',
                                title: 'Dispensary Name',
                                sortable: true,
                                hidden: hideCols.includes('dispensary.name'),
                            },
                            {
                                accessor: 'user.name',
                                title: 'User Name',
                                sortable: true,
                                hidden: hideCols.includes('user.name'),
                            },
                            {
                                accessor: 'user.email',
                                title: 'User Email',
                                sortable: true,
                                hidden: hideCols.includes('user.email'),
                            },
                            {
                                accessor: 'user.phone',
                                title: 'User Phone',
                                sortable: true,
                                hidden: hideCols.includes('user.phone'),
                            },
                            {
                                accessor: 'supplier.name',
                                title: 'Supplier Name',
                                sortable: true,
                                hidden: hideCols.includes('supplier.name'),
                            },
                            {
                                accessor: 'supplier.email',
                                title: 'Supplier Email',
                                sortable: true,
                                hidden: hideCols.includes('supplier.email'),
                            },
                            {
                                accessor: 'supplier.phone',
                                title: 'Supplier Phone',
                                sortable: true,
                                hidden: hideCols.includes('supplier.phone'),
                            },
                            {
                                accessor: 'createdAt',
                                title: 'Created At',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { createdAt } = row;

                                    if (createdAt === null) {
                                        return null; // Handle null case if necessary
                                    }
                                return <div>{convertPSTTimestampToTimezone(createdAt, userData.storeTimeZone)}</div>},
                                hidden: hideCols.includes('createdAt'),
                            },
                            {
                                accessor: 'updatedAt',
                                title: 'Updated At',
                                sortable: true,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { updatedAt } = row;

                                    if (updatedAt === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return <div>{convertPSTTimestampToTimezone(updatedAt, userData.storeTimeZone)}</div>},
                                hidden: hideCols.includes('updatedAt'),
                            },
                            {
                                accessor: 'action',
                                title: 'Action',
                                sortable: false,
                                render: (row) => {
                                    if (!row) {
                                        return null; // Handle the null case as needed
                                    }
                                    const { id, dispensaryId, supplierId, userId, itemCategoryId, itemCategory, name, sku, upc, price, productUnitOfMeasure,
                                    unitOfNetWeight, unitOfUnitWeight, unitWeight, netWeight, createdAt, updatedAt, isApplyUnitWeight } = row;

                                    if (updatedAt === null) {
                                        return null; // Handle null case if necessary
                                    }
                                    return (
                                    <div>
                                        <Tippy content="Edit">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setModalMode('update');
                                                    setCurrentProduct({
                                                        id,
                                                        dispensaryId,
                                                        supplierId,
                                                        userId,
                                                        itemCategoryId,
                                                        itemCategory,
                                                        name,
                                                        sku,
                                                        upc,
                                                        price,
                                                        productUnitOfMeasure,
                                                        unitOfNetWeight, 
                                                        unitOfUnitWeight, 
                                                        isApplyUnitWeight: isApplyUnitWeight,
                                                        unitWeight,
                                                        netWeight,
                                                        createdAt,
                                                        updatedAt,
                                                    });
                                                    setModalShow(true);
                                                }}
                                            >
                                                <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                            </button>
                                        </Tippy>
                                        <Tippy content="Delete">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteAlert(id, name);
                                                }}
                                            >
                                                <IconTrashLines />
                                            </button>
                                        </Tippy>
                                    </div>
                                )},
                            },
                        ]}
                        totalRecords={totalCount ?? 0}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        onRowClick={(record, index) => {
                            // setSideBarStatus({ show: true, data: { packageId: record.id, deliverId: record.deliveryId } });
                            // setTransferId(record.id || '')
                            // setDeliverId(record.deliveryId || 0)
                            handleRowClick(record, index);
                        }}
                        // loaderSize="xl"
                        // noRecordsText="No products found"
                        loaderBackgroundBlur={80}
                        customLoader={<TableLoading text="Loading Product Data..." />}
                    />
                </div>
            </div>
            <div className={`fixed bottom-0 z-[101] transition-all duration-500 h-full right-0 bg-white ${isRightBarShow ? 'w-[500px]' : 'w-0'}`}>
                <div className="bg-[#fafafa] dark:bg-[#060818] h-full py-2 border-l-2 border-gray-300 dark:border-[#1a1e3b]">
                    <PerfectScrollbar>
                        <div className="py-2 flex justify-between items-center border-b-[1px] border-gray-300 dark:border-[#1a1e3b] ">
                            <button
                                type="button"
                                className="collapse-icon flex h-8 w-8 mx-3 items-center transition duration-300 text-dark dark:text-white-dark hover:text-gray-600 rtl:rotate-180 dark:hover:text-gray-400"
                                onClick={() => setIsRightBarShow(false)}
                            >
                                <FaArrowRightFromBracket className="m-auto text-2xl" />
                            </button>
                        </div>
                        {(productRowDataById.isLoading || productRowDataById.isFetching) ?
                        <LoadingSkeleton/>
                        : 
                        <div>
                        <div className="flex flex-col items-center px-3">
                            <div className="w-full text-lg text-dark dark:text-white-dark font-semibold py-2">{productDataById?.name}</div>
                            <div className="w-full bg-white dark:bg-[#0f1727] rounded-md border-[1px] border-gray-50  dark:border-[#1a1e3b] shadow-sm shadow-gray-200 dark:shadow-[#0a0b0f]">
                                <div
                                    className={`pb-2 rounded-t-md border-gray-200 dark:border-[#1a1e3b] font-bold text-dark dark:text-white-dark dark:bg-`}
                                >
                                    <div className='text-xl font-semibold m-2'>Product Details</div>
                                    <hr className='border-gray-100 dark:border-[#23284e]'/>
                                </div>
                                {/* <div className="p-3 border-b-gray-200 border-b-[1px]  dark:border-[#1a1e3b] text-lg font-semibold text-dark dark:text-white-dark">Product Details</div> */}
                                <div className="p-3 flex flex-col ">
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Supplier:</div>
                                        <div className="w-[50%] text-left">{productDataById?.supplier?.name}</div>
                                    </div>
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Product Category:</div>
                                        <div className="w-[50%] text-left">{productDataById?.itemCategory?.name}</div>
                                    </div>
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Unit of Measure:</div>
                                        <div className="w-[50%] text-left">{productDataById?.productUnitOfMeasure}</div>
                                    </div>
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Unit Weight:</div>
                                        <div className="w-[50%] text-left">{productDataById?.unitWeight}</div>
                                    </div>
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Sales Price:</div>
                                        <div className="w-[50%] text-left">${productDataById?.price}</div>
                                    </div>
                                    {/* <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">From License Number:</div>
                                        <div className="w-[50%] text-left">{productDataById?.ShipperFacilityLicenseNumber}</div>
                                    </div>
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Marijuana Transfer:</div>
                                        <div className="w-[50%] text-left">{productDataById?.isMJ}</div>
                                    </div>
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Supplier:</div>
                                        <div className="w-[50%] text-left">{productDataById?.ShipperFacilityName}</div>
                                    </div>
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Total Packages:</div>
                                        <div className="w-[50%] text-left">{productDataById?.PackageCount}</div>
                                    </div>
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Receieved Date:</div>
                                        <div className="w-[50%] text-left">{productDataById?.ReceivedDateTime}</div>
                                    </div>
                                    <div className="flex justify-start items-center my-[6px] text-md">
                                        <div className="w-[50%] text-left !font-varela_Round font-semibold text-dark dark:text-white-dark">Total Cost:</div>
                                        <div className="w-[50%] text-left">{}</div>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col itens-center px-3">
                            {packageData ? packageData.map((data, key) => <ProductCard key={key} packageData={data} />) : null}
                        </div>
                        {/* <div className="text-xl font-bold px-3 pt-3 text-dark dark:text-white-dark">Active Inventory at {productDataById?.dispensary?.name}</div> */}
                        {/* <div className="flex flex-col itens-center px-3">
                            {packageData ? packageData.filter((data) => data?.packageStatus == 'ACTIVE').length == 0 ? <div className='text-gray-400 dark:text-gray-600 text-center text-sm my-1'>No Active Package</div> : packageData.filter((data) => data?.packageStatus == 'ACTIVE').map((data, key) => <ProductCard key={key} packageData={data} />) : null}
                        </div> */}
                        {/* {!isShowFinishedPackage && <button className="btn shadow-none hover:bg-gray-300 text-dark dark:text-white-dark text-md bg-gray-200 dark:bg-[#1c2942] dark:hover:bg-[#172236] dark:border-[#23284e] px-10 py-2 my-3 mx-auto rounded-md" onClick={() => setIsShowFinishedPackage(!isShowFinishedPackage)}>
                            Show finished packages
                        </button>} */}
                        {/* {isShowFinishedPackage && (
                            <div>
                                <div className="text-xl font-bold px-3 pt-1 text-dark dark:text-white-dark">Inactive Packages at {productDataById?.dispensary?.name}</div>
                                <div className="flex flex-col items-center px-3">
                                    {packageData ? packageData.filter((data) => data?.packageStatus != 'ACTIVE').length == 0 ? <div className='text-gray-400 dark:text-gray-600 text-center text-sm my-1'>No Inactive Package</div> : packageData.filter((data) => data?.packageStatus != 'ACTIVE' ).map((data, key) => <ProductCard key={key} packageData={data} />) : null}
                                </div>
                            </div>
                        )} */}
                        </div>}
                    </PerfectScrollbar>
                </div>
            </div>
            <ProductRegisterModal
                setModalShow={setModalShow}
                modalShow={modalShow}
                modalMode={modalMode}
                currentProduct={currentProduct}
                itemCategories={itemCategories}
                userId={userId}
                dispensaryId={dispensaryId}
            />
        </div>
    );
};

export default ProductTable;
