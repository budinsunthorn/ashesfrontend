'use client';
import PanelCodeHighlight from '@/components/panel-code-highlight';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import successAlert from '@/components/notification/successAlert';
import errorAlert from '@/components/notification/errorAlert';
import warnAlert from '@/components/notification/warnAlert';
import MaskedInput from 'react-text-mask';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

import { useMetrcInfoByDispensaryIdQuery, useMetrcConnectUpdateMutation } from '@/src/__generated__/operations';
import { useQueryClient } from '@tanstack/react-query';
import { userDataSave } from '@/store/userData';

const PageContent = () => {
    const { userData } = userDataSave();
    const dispensaryId = userData.dispensaryId;

    const queryClient = useQueryClient();
    const metrcInfo = useMetrcInfoByDispensaryIdQuery({ dispensaryId: dispensaryId });
    const metrcConnectionUpdateMutation = useMetrcConnectUpdateMutation();

    const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(false);
    const [currentMetrcInfo, setMetrcInfo] = useState<any>(metrcInfo.data?.metrcInfoByDispensaryId);

    useEffect(() => {
        if (!currentMetrcInfo) setMetrcInfo(metrcInfo.data?.metrcInfoByDispensaryId);
    }, [metrcInfo]);

    const handleUpdateMetcConnection = async () => {
        setIsSaveButtonDisabled(true);
        await metrcConnectionUpdateMutation.mutate(
            {
                input: {
                    dispensaryId: dispensaryId,
                    metrcApiKey: currentMetrcInfo.metrcApiKey,
                    metrcConnectionStatus: currentMetrcInfo.metrcConnectionStatus,
                },
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (!data) return;
                    const refetch = async () => {
                        return await queryClient.refetchQueries(['MetrcInfoByDispensaryId']);
                    };
                    refetch();
                    successAlert('Metrc Connection has been saved successfully!');
                },
                onSettled() {
                    setIsSaveButtonDisabled(false);
                },
            },
        );
    };

    if (currentMetrcInfo)
        return (
            <div>
                {/* <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="#" className="text-primary hover:underline">
                            Metrc
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Connection</span>
                    </li>
                </ul> */}
                <div className="grid grid-cols-1 gap-6 pt-5">
                    <PanelCodeHighlight title="Metrc Connection" codeHighlight={`This is Help Part`}>
                        <div className="mb-5 space-y-5">
                            <div className="flex flex-col sm:flex-row">
                                <label htmlFor="metrcUserApiKey" className="mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                    Metrc API
                                </label>
                                <label className="w-12 h-6 relative">
                                    <input
                                        type="checkbox"
                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                        id="metrcConnectionStatus"
                                        defaultChecked={currentMetrcInfo.metrcConnectionStatus}
                                        onChange={() => {
                                            setMetrcInfo({ ...currentMetrcInfo, metrcConnectionStatus: !currentMetrcInfo.metrcConnectionStatus });
                                        }}
                                    />
                                    <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                            </div>
                            <div className="flex flex-col sm:flex-row">
                                <label htmlFor="metrcLicenseNumber" className="mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                    Metrc License Number
                                </label>
                                <input
                                    id="metrcLicenseNumber"
                                    type="text"
                                    placeholder="Enter Metrc License Number"
                                    className="form-input flex-1"
                                    value={currentMetrcInfo.cannabisLicense}
                                    onChange={(e) => {
                                        setMetrcInfo({ ...currentMetrcInfo, metrcLicenseNumber: e.target.value });
                                    }}
                                    disabled
                                />

                                {/* <input
                                id="metrcLicenseNumber"
                                type="text"
                                placeholder="Enter Metrc License Number"
                                className="form-input flex-1"
                                value={currentMetrcInfo.metrcLicenseNumber}
                                onChange={(e) => {
                                    setMetrcInfo({ ...currentMetrcInfo, metrcLicenseNumber: e.target.value })
                                }}
                            /> */}
                            </div>
                            <div className="flex flex-col sm:flex-row">
                                <label htmlFor="metrcUserApiKey" className="mb-0 rtl:ml-2 sm:w-1/4 sm:ltr:mr-2">
                                    Metrc API Key
                                </label>
                                <input
                                    id="metrcApiKey"
                                    type="text"
                                    placeholder="Enter Metrc User API Key"
                                    className="form-input flex-1"
                                    value={currentMetrcInfo.metrcApiKey}
                                    onChange={(e) => {
                                        setMetrcInfo({ ...currentMetrcInfo, metrcApiKey: e.target.value });
                                    }}
                                />
                            </div>
                            <button onClick={handleUpdateMetcConnection} type="button" className="btn btn-primary !mt-6 float-right" disabled={isSaveButtonDisabled}>
                                Save
                            </button>
                        </div>
                    </PanelCodeHighlight>
                </div>
            </div>
        );
    else return <div>No Store</div>;
};

export default PageContent;
