import Link from 'next/link';
import React from 'react';
import IconLoader from '@/components/icon/icon-loader';
import SalesReport from '@/components/datatables/salesReport';

const Sales = ({ organization }: any) => {
    return (
        <div>
            {/* <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Report
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Sales</span>
                </li>
            </ul> */}
            <div className="mt-3">
                <SalesReport/>
            </div>
        </div>
    );
};

export default Sales;