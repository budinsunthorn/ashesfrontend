import Link from 'next/link';
import React from 'react';
import Summary from '@/components/datatables/summary';

const PageContent = ({ organization }: any) => {
    return (
        <div>
            {/* <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="text-primary hover:underline">
                        Insight
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Summary</span>
                </li>
            </ul> */}
            <div className="mt-3">
                <Summary/>
            </div>
        </div>
    );
};

export default PageContent;