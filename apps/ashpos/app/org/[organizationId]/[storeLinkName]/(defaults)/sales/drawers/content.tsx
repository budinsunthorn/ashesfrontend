import React, { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import DrawersTable from '@/components/datatables/drawersTable';

const PageContent = () => {
    return (
        <div className=''>
            {/* <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Sales
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Customer Queue</span>
                </li>
            </ul> */}
            <DrawersTable />
        </div>
    );
};

export default PageContent;
