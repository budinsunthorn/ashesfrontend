import Link from 'next/link';
import React from 'react';
import FinishPackageTable from '@/components/datatables/FinishPackageTable';

const PageContent = ({ organization }: any) => {
    return (
        <div>
            {/* <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Inventory
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Finish Packages</span>
                </li>
            </ul> */}
            <div className="mt-3">
                <FinishPackageTable />
            </div>
        </div>
    );
};

export default PageContent;