import Link from 'next/link';
import React from 'react';
import IconLoader from '@/components/icon/icon-loader';
import DayTimeTable from '@/components/datatables/dayTimeTable';

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
                    <span>Day & Time</span>
                </li>
            </ul> */}
            <div className="mt-3">
                <DayTimeTable/>
            </div>
        </div>
    );
};

export default PageContent;