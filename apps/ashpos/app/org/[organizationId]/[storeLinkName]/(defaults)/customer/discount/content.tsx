import DiscountTable from '@/components/datatables/discountTable';
import Link from 'next/link';
('');
import React from 'react';

const PageContent = ({ organization }: any) => {
    return (
        <div>
            {/* <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Customer
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Discount</span>
                </li>
            </ul> */}
            <DiscountTable />
        </div>
    );
};

export default PageContent;
