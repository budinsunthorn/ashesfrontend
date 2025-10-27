'use client';
import { PropsWithChildren, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useAtom } from 'jotai';
import { spinnerAtom } from './store/spinnerStatus';
import { IRootState } from '@/store';
import { toggleRTL, toggleTheme, toggleMenu, toggleLayout, toggleAnimation, toggleNavbar, toggleSemidark } from '@/store/themeConfigSlice';
import Loading from '@/components/layouts/factors/loading';
import { getTranslation } from '@/i18n';
import Spinner from './components/etc/spinnerStatus';
import './styles/index.css';
import { ReactNotifications } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // default: true
        },
    },
});

function App({ children }: PropsWithChildren) {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();
    const { initLocale } = getTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [spinnerStatus] = useAtom(spinnerAtom)

    useEffect(() => {
        dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
        dispatch(toggleMenu(localStorage.getItem('menu') || themeConfig.menu));
        dispatch(toggleLayout(localStorage.getItem('layout') || themeConfig.layout));
        dispatch(toggleRTL(localStorage.getItem('rtlClass') || themeConfig.rtlClass));
        dispatch(toggleAnimation(localStorage.getItem('animation') || themeConfig.animation));
        dispatch(toggleNavbar(localStorage.getItem('navbar') || themeConfig.navbar));
        dispatch(toggleSemidark(localStorage.getItem('semidark') || themeConfig.semidark));
        // locale
        initLocale(themeConfig.locale);

        setIsLoading(false);
    }, [dispatch, initLocale, themeConfig.theme, themeConfig.menu, themeConfig.layout, themeConfig.rtlClass, themeConfig.animation, themeConfig.navbar, themeConfig.locale, themeConfig.semidark]);
    console.log("App rendered")
    return (
        <QueryClientProvider client={queryClient}>
            <ReactNotifications />
            <div
                className={`${(themeConfig.sidebar && 'toggle-sidebar') || ''} ${themeConfig.menu} ${themeConfig.layout} ${
                    themeConfig.rtlClass
                } main-section relative font-nunito text-sm font-normal antialiased`}
            >   
                {spinnerStatus.isLoading === true ? <Spinner/> : null}
                {isLoading ? <Loading /> : children}
            </div>
        </QueryClientProvider>
    );
}

export default App;
