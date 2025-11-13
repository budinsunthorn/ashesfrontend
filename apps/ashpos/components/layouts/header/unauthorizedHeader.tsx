'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { IRootState } from '@/store';
import { toggleMenu, resetToggleSidebar } from '@/store/themeConfigSlice';
import { toggleTheme, toggleSidebar, toggleRTL } from '@/store/themeConfigSlice';
import IconSun from '@/components/icon/icon-sun';
import IconMoon from '@/components/icon/icon-moon';

import { usePathname } from 'next/navigation';

import IconLogin from '@/components/icon/icon-login';
import IconLogout from '@/components/icon/icon-logout';

const UnauthorizedHeader = () => {
    const pathname = usePathname();
    const dispatch = useDispatch();

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }

            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');

            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [pathname]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType)

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    //Budin: Set menu as horizontal because vertical is not suitable for unauthorized pages
    // dispatch(toggleMenu('horizontal'));
    // dispatch(resetToggleSidebar());
    /////////////////////////////////////////////////////////////////////////////////

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="flex shadow-sm ">
                <div className="relative flex justify-between w-full items-center bg-white px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="inline w-36 h-10 ltr:-ml-1 rtl:-mr-1" src="/assets/images/ashpos-logo.png" alt="logo" />
                        </Link>
                    </div>
                    <div className='flex items-center'>
                        <div className="mx-2">
                            {themeConfig.theme === 'light' ? (
                                <button
                                    className={`${
                                        themeConfig.theme === 'light' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('dark'))}
                                >
                                    <IconSun />
                                </button>
                            ) : (
                                ''
                            )}
                            {themeConfig.theme === 'dark' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'dark' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary text-white-dark dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('light'))}
                                >
                                    <IconMoon />
                                </button>
                            )}
                            {/* {themeConfig.theme === 'system' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'system' &&
                                        'flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => dispatch(toggleTheme('light'))}
                                >
                                    <IconLaptop />
                                </button>
                            )} */}
                        </div>
                        <div className="flex items-center">
                            <Link href='/org-access' className="btn btn-outline-primary gap-1 pl-3 pr-3">
                                <IconLogin className="h-4 w-4" /> Sign In
                            </Link>
                            {/* <button type="button" className="btn btn-outline-primary">
                            <IconLogin className="h-4 w-4" /> Sign In
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default UnauthorizedHeader;
