import { Metadata } from 'next';
import FaQWithTab from '@/components/etc/faqWithTabs';
import UnauthorizedHeader from '@/components/layouts/header/unauthorizedHeader';

export const metadata: Metadata = {
    title: 'Dashboard',
};

const Ashpos = () => {
    return (
        <div>
            {/* <div className='flex justify-end items-center p-5'>
                <a href='/org-access' className='btn btn-primary'>Signin to Retail</a>
            </div> */}
            <UnauthorizedHeader />
            <FaQWithTab />
            <div className="panel mt-1 text-center md:mt-1">
                <h3 className="mb-2 text-xl font-bold text-dark md:text-2xl dark:text-white-dark">Still need help?</h3>
                <div className="text-lg font-medium text-white-dark">
                    If you have questions, don't hesitate to reach out to your onboarding manager or contact support at <span className="text-primary ml-2">team@ashes.ai</span> or <span className="text-primary ml-2">+1 (405) 915 9613</span>
                </div>
                {/* <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row">
                    <button type="button" className="btn btn-primary">
                        Contact Us
                    </button>
                    <button type="button" className="btn btn-primary">
                        Visit our community
                    </button>
                </div> */}
            </div>
        </div>
    )
};

export default Ashpos;
