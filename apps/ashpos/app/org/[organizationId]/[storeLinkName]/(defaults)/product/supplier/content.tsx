import SuppliersTable from '@/components/datatables/suppliersTable';
import Link from 'next/link';
('');
import React from 'react';

const PageContent = ({ organization }: any) => {
    return (
        <div>
            {/* <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Product
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Supplier</span>
                </li>
            </ul> */}
            <SuppliersTable />
        </div>
    );
};

export default PageContent;
