'use client';
import Cookies from 'universal-cookie';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { redirect, useParams, useRouter } from 'next/navigation';
import { useLoginUserMutation } from '@/src/__generated__/operations';
import React, { useState, useEffect, useRef } from 'react';
import warnAlert from '@/components/notification/warnAlert';
import errorAlert from '@/components/notification/errorAlert';
import { userDataSave } from '@/store/userData';
// import { jwtDecode, JwtPayload } from "jwt-decode";
import jwt from 'jsonwebtoken';
import { CustomJwtPayload, isTokenExpired } from '@/store/token';
import dotenv from 'dotenv';
import Link from 'next/link';
import { cn } from "../../lib/utils";
import { FaArrowLeft } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';
dotenv.config();

const ComponentsAuthLoginForm = () => {
    const cookies = new Cookies();
    const { storeLinkName } = useParams();
    const { organizationId } = useParams();
    const { userData, setUserData } = userDataSave();
    const router = useRouter();
    const loginUserMutation = useLoginUserMutation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // console.log("email", email)

    const handleLoginUser = async () => {
        if (email === '' || password === '') {
            warnAlert('Insert email and password');
            return;
        }
        setIsLoading(true)
        setEmail(email.trim());
        const response = await fetch(process.env.NEXT_PUBLIC_REST_API_URL + '/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, storeLinkName }),
        });

        const result = await response.json();

        if (result.token === 'none') {
            errorAlert('Your credential is not correct');
            setIsLoading(false)
            return;
        } else {
            const loginData: any = jwt.decode(result.token);
            if (!loginData.isActive) {
                warnAlert('You are not active now');
                return;
            } else {
                cookies.set('token', result.token, {
                    // httpOnly: true,
                    maxAge: 100 * 3600,
                    path: '/',
                    sameSite: 'lax',
                });

                setUserData({
                    ...userData,
                    logined: true,
                    userId: loginData.userId,
                    email: loginData.email,
                    name: loginData.name,
                    userType: loginData.userType,
                    organizationId: loginData.organizationId,
                    storeLinkName: loginData.storeLinkName,
                    storeName: loginData.storeName,
                    orgLinkName: loginData.orgLinkName,
                    dispensaryId: loginData.dispensaryId,
                    isActive: loginData.isActive,
                    isDispensaryAdmin: loginData.isDispensaryAdmin,
                    isEmailVerified: loginData.isEmailVerified,
                    isOrganizationAdmin: loginData.isOrganizationAdmin,
                    locationState: loginData.locationState,
                    storeTimeZone: loginData.storeTimeZone,
                    isCustomerAgeVerify: loginData.isCustomerAgeVerify,
                });
                console.log('loginData', loginData);
                // window.location.href = `/org/${orgLinkName}/${storeLinkName}`;
                window.location.href = `/org/${loginData.orgLinkName}/${loginData.storeLinkName}`;
            }
        }

        // await loginUserMutation.mutate(
        //     {
        //         input: {
        //             email: email,
        //             password: password
        //         },
        //     },
        //     {
        //         onError(error) {
        //             console.error(error.message)
        //         },
        //         onSuccess(data) {
        //             const loginData: CustomJwtPayload = jwtDecode(data.loginUser.token)

        //             if (loginData.userId === '' || loginData.userId === null) {
        //                 errorAlert("Your credential is not correct")
        //                 return

        //             } else {
        //                 if (!loginData.isActive) {
        //                     warnAlert("You are not active now")
        //                     return
        //                 } else {
        //                     cookies.set('token', data.loginUser.token,
        //                         {
        //                             // httpOnly: true,
        //                             maxAge: 3 * 60 * 60 * 1000,
        //                             path: '/',
        //                         }
        //                     );

        //                     setUserData({
        //                         ...userData,
        //                         logined: true,
        //                         userId: loginData.userId,
        //                         email: loginData.email,
        //                         name: loginData.name,
        //                         userType: loginData.userType,
        //                         dispensaryId: loginData.dispensaryId,
        //                         isActive: loginData.isActive,
        //                         isDispensaryAdmin: loginData.isDispensaryAdmin,
        //                         isEmailVerified: loginData.isEmailVerified,
        //                         isOrganizationAdmin: loginData.isOrganizationAdmin,
        //                         locationState: loginData.locationState,
        //                     })
        //                     router.push('/')
        //                 }

        //             }
        //         },
        //         onSettled() {
        //         },
        //     },
        // )
        // setIsLoading(false)
    };

    const handleKeyDown = (event : any) => {
        if (event.key === 'Enter' && buttonRef.current) {
            buttonRef?.current.click();
        }
    };
    useEffect(() => {

        // Add event listener for keydown events
        window.addEventListener('keydown', handleKeyDown);

        // // Cleanup function to remove the event listener
        // return () => {
        //     window.removeEventListener('keydown', handleKeyDown);
        // };
    }, []); // Empty dependency array ensures this runs once on mount and cleanup on unmount


    return (
        <form className="space-y-5 dark:text-white">
            <div>
                <label htmlFor="Email">Email</label>
                <div className="relative text-white-dark">
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter Email"
                        autoComplete='email'
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}  
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="Password">Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter Password"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            {/* <div>
                <label className="flex cursor-pointer items-center">
                    <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                    <span className="text-white-dark">Subscribe to weekly newsletter</span>
                </label>
            </div> */}
            <button
                type="button"
                className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                onClick={handleLoginUser}                
                ref={buttonRef}
                disabled={isLoading}
            >
                {isLoading ? <BiLoaderAlt className='mr-2 animate-spin'/> : null}Sign in
            </button>
            <div className='flex justify-between items-c'>
                <div className="text-base text-dark dark:text-white-dark underline text-right cursor-pointer hover:text-gray-400">
                    <Link href="/org-access" className='flex items-center gap-2'>
                        <FaArrowLeft />
                        Go to organization
                    </Link>
                </div>
                <div className="text-base text-dark dark:text-white-dark underline text-right cursor-pointer hover:text-gray-400">
                    <Link href="/reset-pass">Forgot password</Link>
                </div>
            </div>
        </form>
    );
};

export default ComponentsAuthLoginForm;
