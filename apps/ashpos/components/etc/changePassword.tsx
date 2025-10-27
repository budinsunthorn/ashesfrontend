"use client"

import React, { useState } from 'react'
import { useSelector } from 'react-redux';

import { IRootState } from '@/store';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import warnAlert from '../notification/warnAlert';
import { useChangePasswordMutation } from '@/src/__generated__/operations';

import { userDataSave } from '@/store/userData';
import successAlert from '../notification/successAlert';
function ChangePassword() {
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);
    const { userData } = userDataSave();
    const userId = userData.userId;
    const [showOldPass, setShowOldPass] = useState(false);    
    const [showNewPass, setShowNewPass] = useState(false);    
    const [showConfirmPass, setShowConfirmPass] = useState(false); 
    
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    // Mutation
    const changePasswordMutation = useChangePasswordMutation();

    const handleChangePass = async () => {
        if(newPass !== confirmPass) {
            warnAlert("Pasword doesn't matched")
            return
        }
        await changePasswordMutation.mutate(
            {
                userId: userId,
                newPassword: newPass,
                oldPassword: oldPass
            },
            {
                onError(error) {
                    warnAlert(error.message);
                },
                onSuccess(data) {
                    if (data.changePassword == null || data.changePassword == undefined) {
                        warnAlert("Old password is not correct")    
                        return
                    };
                    successAlert('Password changed Successfully!');
                },
            }
        );

    }


    return (
        <div className={`panel mt-6 !pt-2 ${panelType == 'plain' ? 'plain-panel' : ''}`}>
            <div className="my-2 flex flex-col gap-5 items-start">
                <h5 className="text-lg font-semibold dark:text-white-dark text-dark text-left">Change Password</h5>
                <div className='w-full flex flex-col justify-center items-center'>
                    <div className='relative flex justify-start items-center mt-2 w-[700px]'>
                        <label className="text-sm text-right text-gray-600 dark:text-gray-400 mr-5 text-nowrap w-[150px]">Old Password:</label>
                        <input type={showOldPass ? "text" : "password"} placeholder="Enter old password" className="form-input" onChange={(e) => setOldPass(e.target.value)}/>
                        {showOldPass ? <FaRegEyeSlash className='absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-600 dark:text-gray-400' onClick={() => setShowOldPass(!showOldPass)}/>
                        : <FaRegEye className='absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-600 dark:text-gray-400' onClick={() => setShowOldPass(!showOldPass)} />}
                    </div>
                    <div className='relative flex justify-start items-center mt-2 w-[700px]'>
                        <label className="text-sm text-right text-gray-600 dark:text-gray-400 mr-5 text-nowrap w-[150px]">New Password:</label>
                        <input type={showNewPass ? "text" : "password"} placeholder="Enter new password" className="form-input" onChange={(e) => setNewPass(e.target.value)}/>
                        {showNewPass ? <FaRegEyeSlash className='absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-600 dark:text-gray-400' onClick={() => setShowNewPass(!showNewPass)}/>
                        : <FaRegEye className='absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-600 dark:text-gray-400' onClick={() => setShowNewPass(!showNewPass)} />}
                    </div>
                    <div className='relative flex justify-start items-center mt-2 w-[700px]'>
                        <label className="text-sm text-right text-gray-600 dark:text-gray-400 mr-5 text-nowrap w-[150px]">Confirm Password:</label>
                        <input type={showConfirmPass ? "text" : "password"} placeholder="Enter confirm password" className="form-input" onChange={(e) => setConfirmPass(e.target.value)}/>
                        {showConfirmPass ? <FaRegEyeSlash className='absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-600 dark:text-gray-400' onClick={() => setShowConfirmPass(!showConfirmPass)}/>
                        : <FaRegEye className='absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-600 dark:text-gray-400' onClick={() => setShowConfirmPass(!showConfirmPass)} />}
                    </div>
                    <div className='w-full flex justify-end mt-5'>
                        <button className='btn btn-primary' onClick={handleChangePass}>Save Password</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangePassword