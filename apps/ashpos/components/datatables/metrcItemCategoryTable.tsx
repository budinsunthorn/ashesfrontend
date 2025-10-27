'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

import { useMetrcItemCategoryByDispensaryIdQuery } from '@/src/__generated__/operations';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { BsColumns } from 'react-icons/bs';
import { userDataSave } from '@/store/userData';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import ExportTable from '../etc/exportTable';
import TableLoading from '../etc/tableLoading';

const MetrcItemCategoryTable = () => {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;

    const metrcItemCategoryByDispensaryId = useMetrcItemCategoryByDispensaryIdQuery({ dispensaryId: dispensaryId });

    const itemCategoryData = metrcItemCategoryByDispensaryId.data?.metrcItemCategoryByDispensaryId;

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType)
    // show/hide
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    //@ts-expect-error
    const [initialRecords, setInitialRecords] = useState<RowData>(sortBy(itemCategoryData, 'name'));
    const [recordsData, setRecordsData] = useState(initialRecords.slice(0, pageSize));
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    const [hideCols, setHideCols] = useState<any>([]);
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        if (initialRecords) setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        if (itemCategoryData) {
            setInitialRecords(() => {
                return itemCategoryData?.filter((item) => {
                    return (
                        item?.Name?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.ProductCategoryType?.toLowerCase().includes(search.toLowerCase()) ||
                        item?.createdAt.toString().includes(search.toLowerCase()) ||
                        item?.updatedAt.toString().includes(search.toLowerCase())
                    );
                });
            });
        }
    }, [search, itemCategoryData]);
    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    const showHideColumns = (col: any, value: any) => {
        if (hideCols.includes(col)) {
            setHideCols((col: any) => hideCols.filter((d: any) => d !== col));
        } else {
            setHideCols([...hideCols, col]);
        }
    };
    const cols = [
        { accessor: 'Name', title: 'Name' },
        { accessor: 'ProductCategoryType', title: 'Category Type' },
        { accessor: 'QuantityType', title: 'Quantity Type' },
    ];
    return (
        <div className={`panel mt-6 pt-2 ${panelType == "plain" ? "plain-panel" : ""}`}>
            <div className="my-2 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 className="text-lg font-semibold dark:text-white-dark">Metrc Item Category</h5>
                <div className="lg:flex items-center gap-5 lg:ltr:ml-auto rtl:mr-auto">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
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
                                                            defaultValue={col.accessor}
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
                        <ExportTable cols={cols} recordsData={recordsData} hideCols={hideCols} filename='metrcItemCategory_table_data'/>
                    </div>
                    <div className="text-right">
                        <input type="text" className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="datatables">
                <DataTable
                    className="table-hover whitespace-nowrap"
                    records={recordsData ?? []}
                    fetching={metrcItemCategoryByDispensaryId.isLoading || metrcItemCategoryByDispensaryId.isFetching}
                    loaderBackgroundBlur={80}
                    customLoader={<TableLoading text="Loading Product Data..." />}
                    columns={[
                        {
                            accessor: 'index',
                            title: '#',
                            width: 40,
                            render: (record) => (initialRecords ? initialRecords.indexOf(record) + 1 : 0),
                        },
                        {
                            accessor: 'id',
                            title: 'ID',
                            sortable: true,
                            hidden: true,
                        },
                        {
                            accessor: 'Name',
                            title: 'Name',
                            sortable: true,
                        },
                        {
                            accessor: 'ProductCategoryType',
                            title: 'Category Type',
                            sortable: true,
                        },
                        {
                            accessor: 'QuantityType',
                            title: 'Quantity Type',
                            sortable: true,
                        },
                    ]}
                    highlightOnHover
                    totalRecords={initialRecords?.length ?? 0}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
        </div>
    );
};

export default MetrcItemCategoryTable;
