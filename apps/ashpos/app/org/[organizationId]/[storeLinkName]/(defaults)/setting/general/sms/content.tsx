"use client";
import { userDataSave } from '@/store/userData';
import React, {useState} from 'react';

import { useDispensaryQuery, useUpdateSmsByDispensaryIdMutation } from '@/src/__generated__/operations';
import successAlert from '@/components/notification/successAlert';


const PageContent = ({ organization }: any) => {
    const {userData} = userDataSave()
    const dispensaryId = userData.dispensaryId
    const [smsStart, setSmsStart] = useState("");
    const [smsEnd, setSmsEnd] = useState("");

    const dispensaryRowData = useDispensaryQuery({id: dispensaryId})
    const dispensaryData = dispensaryRowData.data?.dispensary

    const dispensaryUpdateMutation = useUpdateSmsByDispensaryIdMutation();

    const handleUpdateSms = async () => {
        await dispensaryUpdateMutation.mutate(
            {
                input: {
                    id: dispensaryId,
                    smsOrderStart: smsStart,
                    smsOrderEnd: smsEnd
                }
            },
            {
                onSuccess() {
                    successAlert("Sms updated successfully")
                },
                onError() {

                }
            }
            
        )
    }
    return (
        <div className='h-full'>
            <div className='panel p-5 flex flex-col'>
                <h1 className='text-lg font-semibold dark:text-white-dark'>SMS setting</h1>    
                <div className='my-3'>
                    <h2>SMS start</h2>
                    <input type="text" className='form-input' value={smsStart ? smsStart : dispensaryData?.smsOrderStart || ""} onChange={(e) => setSmsStart(e.target.value)}/>
                </div>
                <div>
                    <h2>SMS End</h2>
                    <input type="text" className='form-input' value={smsEnd ? smsEnd : dispensaryData?.smsOrderEnd || ""} onChange={(e) => setSmsEnd(e.target.value)}/>
                </div>
                <div className='flex justify-end mt-5'>
                    <button className='btn btn-primary' onClick={handleUpdateSms}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageContent;
