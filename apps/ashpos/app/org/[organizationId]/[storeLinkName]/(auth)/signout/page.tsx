'use client';
import Cookies from 'universal-cookie';
import { redirect, usePathname, useRouter } from 'next/navigation';

const SignOut = () => {
    const router = useRouter();

    const cookies = new Cookies();
    cookies.remove('token', { path: '/' });
    // router.push('/signin')
};

export default SignOut;
