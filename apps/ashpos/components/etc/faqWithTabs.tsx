'use client';
import IconBox from '@/components/icon/icon-box';
import IconDesktop from '@/components/icon/icon-desktop';
import IconDollarSignCircle from '@/components/icon/icon-dollar-sign-circle';
import IconMinusCircle from '@/components/icon/icon-minus-circle';
import IconPlusCircle from '@/components/icon/icon-plus-circle';
import IconRouter from '@/components/icon/icon-router';
import IconUser from '@/components/icon/icon-user';
import React, { ReactNode, useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { FaInfoCircle } from "react-icons/fa";
interface FaQWithTabProps {
    title?: ReactNode | any;
}


const FaQWithTab = ({ title = 'Some common <span className="text-primary">questions</span>' }: FaQWithTabProps) => {
    const [activeTab, setActiveTab] = useState<String>('general');
    const [active1, setActive1] = useState<any>(1);
    const [active2, setActive2] = useState<any>(1);

    return (
        <>
            {/* <div className="mb-12 flex items-center rounded-b-md bg-[#DBE7FF] dark:bg-[#141F31]">
                <ul className="mx-auto flex items-center gap-5 overflow-auto whitespace-nowrap px-3 py-4.5 xl:gap-8">
                    <li
                        className={`group flex min-w-[120px] cursor-pointer flex-col items-center justify-center gap-4 rounded-md px-8 py-2.5 text-center text-[#506690] duration-300 hover:bg-white hover:text-primary dark:hover:bg-[#1B2E4B]
    ${activeTab === 'general' ? 'bg-white text-primary dark:bg-[#1B2E4B]' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <IconDesktop fill={true} />

                        <h5 className="font-bold text-dark dark:text-white-dark">General</h5>
                    </li>
                    <li
                        className={`group flex min-w-[120px] cursor-pointer flex-col items-center justify-center gap-4 rounded-md px-8 py-2.5 text-center text-[#506690] duration-300 hover:bg-white hover:text-primary dark:hover:bg-[#1B2E4B]
    ${activeTab === 'quick-support' ? 'bg-white text-primary dark:bg-[#1B2E4B]' : ''}`}
                        onClick={() => setActiveTab('quick-support')}
                    >
                        <IconUser fill={true} className="h-8 w-8" />

                        <h5 className="font-bold text-dark dark:text-white-dark">Quick Support</h5>
                    </li>
                    <li
                        className={`group flex min-w-[120px] cursor-pointer flex-col items-center justify-center gap-4 rounded-md px-8 py-2.5 text-center text-[#506690] duration-300 hover:bg-white hover:text-primary dark:hover:bg-[#1B2E4B]
    ${activeTab === 'free-updates' ? 'bg-white text-primary dark:bg-[#1B2E4B]' : ''}`}
                        onClick={() => setActiveTab('free-updates')}
                    >
                        <IconBox fill={true} />

                        <h5 className="font-bold text-dark dark:text-white-dark">Free Updates</h5>
                    </li>
                    <li
                        className={`group flex min-w-[120px] cursor-pointer flex-col items-center justify-center gap-4 rounded-md px-8 py-2.5 text-center text-[#506690] duration-300 hover:bg-white hover:text-primary dark:hover:bg-[#1B2E4B]
    ${activeTab === 'pricing' ? 'bg-white text-primary dark:bg-[#1B2E4B]' : ''}`}
                        onClick={() => setActiveTab('pricing')}
                    >
                        <IconDollarSignCircle fill={true} />

                        <h5 className="font-bold text-dark dark:text-white-dark">Pricing</h5>
                    </li>

                </ul>
            </div> */}
            {/* <h3 className="mb-8 text-center text-xl font-semibold md:text-2xl text-dark dark:text-white-dark" dangerouslySetInnerHTML={{ __html: title }}></h3> */}
            <div className='mt-2'></div>
            <div className="mb-3 grid grid-cols-1 gap-10">
                <div className="rounded-md bg-white dark:bg-black">
                    <div className="border-b border-white-light p-6 text-[22px] font-bold dark:border-dark text-dark dark:text-white-dark">
                        <span className="text-primary ml-2">Ashes Guide</span>
                    </div>
                    <div className="divide-y divide-white-light px-6 py-4.5 dark:divide-dark">
                        <div>
                            <div
                                className={`flex cursor-pointer items-center justify-between gap-10 px-2.5 py-2 text-base font-semibold hover:bg-primary-light hover:text-primary text-dark dark:text-white-dark dark:hover:bg-[#1B2E4B] dark:hover:text-primary
            ${active1 === 1 ? 'bg-primary-light !text-primary dark:bg-[#1B2E4B]' : ''}`}
                                onClick={() => setActive1(active1 === 1 ? null : 1)}
                            >   <div className='flex justify-start items-center'>
                                <span className='mr-2'><FaInfoCircle /></span>
                                <span>Information needed to onboard with AshesPOS</span></div>
                                {active1 !== 1 ? (
                                    <span className="shrink-0">
                                        <IconPlusCircle duotone={false} />
                                    </span>
                                ) : (
                                    <span className="shrink-0">
                                        <IconMinusCircle fill={true} />
                                    </span>
                                )}
                            </div>
                            <AnimateHeight duration={300} height={active1 === 1 ? 'auto' : 0}>
                                <div className="px-1 py-3 font-semibold text-white-dark">
                                    <p>
                                        Welcome to your new Ashes cannabis retail Point of Sale (POS) system! This guide will help ensure a
                                        smooth onboarding process and full integration with Metrc, your state's cannabis tracking system.
                                    </p>
                                    <br />
                                    <p>
                                        Please follow the instructions below and gather all necessary information prior to your onboarding session.
                                    </p>
                                    <p>
                                        Onboarding Requirements Checklist<br />
                                        Before we can complete your onboarding and activate your POS system, the following information must be
                                        provided:
                                        <br />
                                        <br />
                                        <strong>1. Ashes POS User Credentials</strong><br />
                                        You will need to provide login credentials for each user who will access the Ashes POS system.<br />
                                        Required:<br />
                                        - Full Name<br />
                                        - Email Address<br />
                                        - Username<br />
                                        - Temporary Password (optional - users can reset upon login)<br />
                                        - User Role (e.g., Manager, Budtender, Admin)<br />
                                        Please ensure that each user has a unique login for tracking and compliance purposes.<br /><br />

                                        <strong>2. Metrc API Key</strong><br />
                                        Metrc integration is critical for compliance. Your API key allows Ashes POS to sync with the Metrc system for real-time inventory and sales tracking.<br />
                                        To obtain your Metrc API Key:<br />
                                        1. Log in to your Metrc account<br />
                                        2. Navigate to your User Profile (top-right corner)<br />
                                        3. Click on API Key<br />
                                        4. Copy and paste your unique API key<br /><br />

                                        <strong>3. Metrc Login Information</strong><br />
                                        For troubleshooting and initial syncing, our team may require access to your Metrc account.
                                        Required:<br />
                                        - Metrc Username<br />
                                        - Metrc Password<br />
                                        - Facility License Number(s)<br />
                                        - State (if operating in multiple jurisdictions)<br />
                                        Your login will only be used by our onboarding specialists and stored securely in compliance with our privacy
                                        policy.<br /><br />

                                        <strong>System Setup Details</strong><br />
                                        Please also be prepared to provide the following:<br />
                                        - Store Hours & Time Zone<br />
                                        - Location Address(es)<br />
                                        - Printer Models (if integrating hardware)<br />
                                        - Existing Inventory Files (if migrating from another system)<br />
                                        - Menu Preferences (e.g., categories, tags, pricing tiers)<br /><br />

                                        <strong>Submitting Your Information</strong><br />
                                        Once you've gathered all the above information, please submit it securely through the onboarding form or
                                        your assigned onboarding representative. If you need help locating your API key or setting up user accounts,
                                        contact our support team.
                                        <strong>Next Steps</strong><br />
                                        Once all credentials and information are received:<br />
                                        - Our team will connect your Ashes POS system to Metrc.<br />
                                        - We will schedule your training session.<br />
                                        - You'll receive login instructions for your staff.<br />
                                        - Inventory import (if applicable) will be initiated<br /><br />
                                    </p>
                                </div>
                            </AnimateHeight>
                        </div>
                        {/* <div>
                            <div
                                className={`flex cursor-pointer items-center justify-between gap-10 px-2.5 py-2 text-base font-semibold hover:bg-primary-light hover:text-primary text-dark dark:text-white-dark dark:hover:bg-[#1B2E4B] dark:hover:text-primary
            ${active1 === 2 ? 'bg-primary-light !text-primary dark:bg-[#1B2E4B]' : ''}`}
                                onClick={() => setActive1(active1 === 2 ? null : 2)}
                            >
                                <span><FaInfoCircle /></span>
                                <span> How to Connect With Metrc</span>
                                {active1 !== 2 ? (
                                    <span className="shrink-0">
                                        <IconPlusCircle duotone={false} />
                                    </span>
                                ) : (
                                    <span className="shrink-0">
                                        <IconMinusCircle fill={true} />
                                    </span>
                                )}
                            </div>
                            <AnimateHeight duration={300} height={active1 === 2 ? 'auto' : 0}>
                                <div className="px-1 py-3 font-semibold text-white-dark">
                                    <p>
                                        The Metrc connection is inside of the profile settings under the store. You would simply just put in the API given to you to initiate the link.  Then you would input this into the metrc section under the settings column.
                                    </p>
                                </div>
                            </AnimateHeight>
                        </div>
                        <div>
                            <div
                                className={`flex cursor-pointer items-center justify-between gap-10 px-2.5 py-2 text-base font-semibold hover:bg-primary-light hover:text-primary text-dark dark:text-white-dark dark:hover:bg-[#1B2E4B] dark:hover:text-primary
            ${active1 === 3 ? 'bg-primary-light !text-primary dark:bg-[#1B2E4B]' : ''}`}
                                onClick={() => setActive1(active1 === 3 ? null : 3)}
                            >
                                <span>How to Sync Metrc Data</span>
                                {active1 !== 3 ? (
                                    <span className="shrink-0">
                                        <IconPlusCircle duotone={false} />
                                    </span>
                                ) : (
                                    <span className="shrink-0">
                                        <IconMinusCircle fill={true} />
                                    </span>
                                )}
                            </div>
                            <AnimateHeight duration={300} height={active1 === 3 ? 'auto' : 0}>
                                <div className="px-1 py-3 font-semibold text-white-dark">
                                    <p>
                                        The Metrc sync process is handled by us automatically; however you have the ability to sync at any time.
                                    </p>
                                </div>
                            </AnimateHeight>
                        </div>
                        <div>
                            <div
                                className={`flex cursor-pointer items-center justify-between gap-10 px-2.5 py-2 text-base font-semibold hover:bg-primary-light hover:text-primary text-dark dark:text-white-dark dark:hover:bg-[#1B2E4B] dark:hover:text-primary
            ${active1 === 5 ? 'bg-primary-light !text-primary dark:bg-[#1B2E4B]' : ''}`}
                                onClick={() => setActive1(active1 === 5 ? null : 5)}
                            >
                                <span>How to Migrate to AshesPOS</span>
                                {active1 !== 5 ? (
                                    <span className="shrink-0">
                                        <IconPlusCircle duotone={false} />
                                    </span>
                                ) : (
                                    <span className="shrink-0">
                                        <IconMinusCircle fill={true} />
                                    </span>
                                )}
                            </div>
                            <AnimateHeight duration={300} height={active1 === 5 ? 'auto' : 0}>
                                <div className="px-1 py-3 font-semibold text-white-dark">
                                    <p>
                                        Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch.
                                        Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et.
                                        Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                                        beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven&apos;t heard of them accusamus labore sustainable VHS.
                                    </p>
                                </div>
                            </AnimateHeight>
                        </div> */}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FaQWithTab;
