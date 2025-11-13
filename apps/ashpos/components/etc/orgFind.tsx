'use client';
import IconFacebookCircle from '@/components/icon/icon-facebook-circle';
import IconGoogle from '@/components/icon/icon-google';
import IconInstagram from '@/components/icon/icon-instagram';
import IconTwitter from '@/components/icon/icon-twitter';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, Fragment, useRef } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import IconX from '../icon/icon-x';
import { set } from 'lodash';
import warnAlert from '../notification/warnAlert';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';


interface Store {
    name: string;
    storeLinkName: string;
}
const OrgFind = () => {
    const router = useRouter()
    const {organizationId} = useParams();
    const [organization, setOrganization] = useState('');
    const [storeList, setStoreList] = useState<Store[]>([]);
    const [showStorelistModel, setShowStorelistModel] = useState(false);

    const handleFindOrganization = async (orgLinkName: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_REST_API_URL}/storelist?orgLinkName=${orgLinkName}`);
            const data = await response.json();
            if(data.length > 0) {
                setShowStorelistModel(true);
                setStoreList(data);
            } else {
                // warnAlert('No store found for this organization.');
                warnAlert('No Organization Found.');
            }
        }
        catch (error) {
                console.error('Error fetching store list:', error);
                warnAlert("An error occurred while fetcing the store list.");
            }
    }
        
    useEffect(() => {
        if (Array.isArray(organizationId)) {
            // Handle the case where it's an array (e.g., take the first element)
            if (organizationId[0] !== 'store') {
                handleFindOrganization(organizationId[0]);
                setOrganization(organizationId[0]);
            } else {
                setOrganization('');
            }
        } else if (organizationId) {
            // It's a string
            if (organizationId !== 'store') {
                setOrganization(organizationId);
                handleFindOrganization(organizationId);
            } else {
                setOrganization('');
            }
        }
    }, [organizationId]);

    // const handleKeyDown = (event: KeyboardEvent) => {  
    //     console.log('Enter key pressed');
    //     if (event.key === 'Enter') {  
    //         event.preventDefault();  
    //         buttonRef.current?.click();  
    //     }  
    // };  

    // useEffect(() => {
    //     if (buttonRef.current) {
    //         buttonRef.current.addEventListener('keydown', handleKeyDown);
    //     }
    //     return () => {
    //         if (buttonRef.current) {
    //             buttonRef.current.removeEventListener('keydown', handleKeyDown);
    //         }
    //     };
    // }, [buttonRef])
    
    
    return (
        <>
            <div className="mb-20 md:mb-32">
                {/* <h2 className="text-lg font-bold uppercase dark:text-white-dark text-dark sm:text-xl">Input Organization</h2> */}
                <div className="relative mb-5 mt-8">
                    <input
                        type="text"
                        name="organization"
                        id="organization"
                        placeholder="Input your organization ID or name"
                        className="form-input mb-5 py-3.5 placeholder:text-base placeholder:text-white-dark sm:mb-0 sm:pe-32"
                        onChange={(e) => setOrganization(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleFindOrganization(organization);
                            }
                        }}
                        autoComplete="on"
                        value={organization}
                    /> 
                    <button
                        type="button"
                        className="btn btn-gradient end-1.5 top-1/2 inline-flex border-0 px-4 py-1.5 text-base shadow-none sm:absolute -translate-y-1/2"
                        onClick={() => handleFindOrganization(organization)}
                    >
                        Go
                    </button>
                </div>
                {/* <button onClick={() => setShowStorelistModel(true)} className='text-sm cursor-pointer underline dark:text-white-dark text-dark dark:hover:text-white-light'>Show Store List</button> */}
            </div>
            <Transition appear show={showStorelistModel} as={Fragment}>
                <Dialog as="div" open={showStorelistModel} onClose={() => setShowStorelistModel(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-100"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div id="slideIn_down_modal" className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                        <div className="flex items-center -translate-y-[100px] justify-center min-h-screen px-4">
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark animate__animated animate__slideInDown">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <div className="font-bold text-lg text-dark dark:text-white-dark">Select Store</div>
                                    <button type="button" onClick={() => setShowStorelistModel(false)} className="text-white-dark hover:text-dark">
                                        <IconX/>
                                    </button>
                                </div>
                                    {/* <h3 className='text-center text-primary font-roboto font-bold my-2'>Available store list</h3> */}
                                    {storeList?.length > 0 ? storeList.map((store, index) => (
                                        <div className='px-5 m-3 py-2 flex justify-start items-center border-b-[1px] border-gray-300 dark:border-[#253b5c] bg-gray-50 dark:bg-[#121c2c] hover:bg-gray-100 dark:hover:bg-[#0f1825] rounded-md cursor-pointer'>
                                            <HiOutlineBuildingStorefront className="text-xl text-primary mr-2 font-semibold" />
                                            <div className='text-lg text-primary font-semibold' key={index} onClick={() => router.push(`/org/${organization}/${store.storeLinkName}/signin`)}>{store.name}</div>
                                        </div>
                                    ))
                                    : (
                                        <div className="text-center px-5 m-3 py-2 bg-gray-50 dark:bg-[#121c2c]">No store found</div>
                                    )}
                                    
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default OrgFind;
