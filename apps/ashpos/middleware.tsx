import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { useParams, useRouter } from 'next/navigation'
import { cookies } from 'next/headers';
// import { jwtDecode } from "jwt-decode";
import jwt from 'jsonwebtoken';

import { CustomJwtPayload, isTokenExpired } from '@/store/token';
// import Cookies from 'universal-cookie';
import { getCookie, setCookie, hasCookie, deleteCookie } from 'cookies-next';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const requestHeaders = new Headers(req.headers);
    // const {storeLinkName} = useParams();
    const url = req.nextUrl;
    const { pathname } = req.nextUrl;

        // Skip static files and public assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/assets') ||
        pathname.startsWith('/public') ||
        pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
    ) {
        return NextResponse.next();
    }

    // const token: any = getCookie('token', { res, req });
    const token = req.cookies.get('token')?.value;
    const testText = getCookie("test")
    // console.log("token ------>", token)
    const decoded: any = jwt.decode(token || '');
    const storeNameFromToken = decoded?.storeLinkName;
    const orgNameFromToken = decoded?.orgLinkName;
    const segments = pathname.split('/')
    const organizationId = segments[2]
    const storeLinkName = segments[3]
    const pageName = segments[4]

    // console.log("✅storeNameFromToken:", storeNameFromToken)
    // console.log("✅orgNameFromToken",orgNameFromToken) 
    // console.log("✅storeLinkName", storeLinkName)
    // console.log("✅organizationId", organizationId)

    const ISMAINTENANCE = process.env.ISMAINTENANCE;

    const orgPathRegex = /^\/org\/[^\/]+$/;

    if (pathname.startsWith('/assets')) {
        return NextResponse.next();
    }

    // console.log("pathname", pathname);

    if(ISMAINTENANCE == "YES") {
        return NextResponse.rewrite(new URL('/org/${orgLinkName}/${storeNameFromToken}/maintenance', req.url));
    }

    if(pathname == "/" || pathname == "/signin" || pathname == "/home") {
        return NextResponse.rewrite(new URL('/', req.url));
    }

    if(pathname == "/org-access") {
        if(token) {
            if(storeNameFromToken && orgNameFromToken) {
                return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}`, req.url));
            } else
            return NextResponse.rewrite(new URL(`/org/store/org-access`, req.url));
        }
        else {
            return NextResponse.rewrite(new URL(`/org/store/org-access`, req.url));
        }
    }

    if (orgPathRegex.test(url.pathname)) {
        // Redirect to the same path with /org-access appended
        if(token) {
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}`, req.url));
        }
        url.pathname = `${url.pathname}/org-access`;
        return NextResponse.redirect(url);
    }

    // if (organizationId != "org-access") {
    //     if(token) {
    //         if(organizationId == orgLinkName) {
    //             return NextResponse.redirect(new URL(`/org/${organizationId}/${storeLinkName}/signin`, req.url));
    //         } else {
    //             return NextResponse.redirect(new URL(`/org/${organizationId}/org-access`, req.url));
    //         }
    //     } else return NextResponse.redirect(new URL(`/org/${organizationId}/org-access`, req.url));
    // }

    // console.log("storeLinkName", storeLinkName);
    // let changed = false;
    if (hasCookie('token', { res, req })) {



        if ((organizationId != undefined && storeLinkName != undefined) && (storeNameFromToken !== storeLinkName || organizationId !== orgNameFromToken)) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_REST_API_URL}/store?storeLinkName=${storeLinkName}&orgLinkName=${organizationId}`);
                const result = await response.json();
                // console.log('result', result);

                if(result.store && result.org) {
                    console.log("🔴Path linkName vary with token's linkName")
                    return NextResponse.rewrite(new URL(`/org/${organizationId}/${storeLinkName}/signin`, req.url));
                } else if (result.org) {
                    return NextResponse.rewrite(new URL(`/org/${organizationId}/org-access`, req.url));
                } else {
                    // return NextResponse.redirect(new URL(`/org/${organizationId}/${storeLinkName}/invalidStoreLink`, req.url));
                    return NextResponse.rewrite(new URL(`/org/${organizationId}/${storeLinkName}/invalidStoreLink`, req.url));
                }
            }
            catch (error) {
                return NextResponse.rewrite(new URL(`/org/${organizationId}/${storeLinkName}/invalidStoreLink`, req.url));
            }
        }

        // if (isTokenExpired(decoded)) {
        //   deleteCookie('token', { res, req });
        //   changed = true
        // }
        // URL Rewirte

        if (pathname == '/change-password') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/changePass`, req.url));  
        }  
        if (pathname == '/sales-cashier') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/sales/cashier`, req.url));  
        }  
        if (pathname == '/sales-queue') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/sales/customer-queue`, req.url));  
        }  
        if (pathname == '/held-orders-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/orders/held-orders`, req.url));  
        }  
        if (pathname == '/orders-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/orders/orders`, req.url));  
        }  
        if (pathname == '/drawers-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/sales/drawers`, req.url));  
        }  
        if (pathname == '/package-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/inventory/package`, req.url));  
        }  
        if (pathname == '/assign-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/inventory/assign`, req.url));  
        }  
        if (pathname == '/transfer-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/inventory/transfer`, req.url));  
        }  
        if (pathname == '/finish_package-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/inventory/finish_package`, req.url));  
        }  
        if (pathname == '/tiny_package-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/inventory/tiny_package`, req.url));  
        }  
        if (pathname == '/metrc-reconciliation') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/inventory/metrc-reconciliation`, req.url));  
        }  
        if (pathname == '/audit-packages') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/inventory/audit-packages`, req.url));  
        }  
        if (pathname == '/supplier-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/product/supplier`, req.url));  
        }  
        if (pathname == '/product-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/product/product`, req.url));  
        }  
        if (pathname == '/customer-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/customer/customers`, req.url));  
        }  
        if (pathname == '/loyalty-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/customer/loyalty`, req.url));  
        }  
        if (pathname == '/discount-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/customer/discount`, req.url));  
        }  
        if (pathname == '/sales-report') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/report/sales`, req.url));  
        }  
        if (pathname == '/payment-report') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/report/payment`, req.url));  
        }  
        if (pathname == '/daytime-insight') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/insight/daytime`, req.url));  
        }  
        if (pathname == '/summary-insight') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/insight/summary`, req.url));  
        }  
        if (pathname == '/action-history') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/insight/actionHistory`, req.url));  
        }  
        if (pathname == '/compliance') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/setting/general/compliance`, req.url));  
        }  
        if (pathname == '/store-details') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/setting/general/store-details`, req.url));  
        }  
        if (pathname == '/user-manage') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/setting/general/users`, req.url));  
        }  
        if (pathname == '/metrc-connection') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/setting/general/metrc-connection`, req.url));  
        }  
        if (pathname == '/metrc-item-category') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/setting/general/metrcItemCategory`, req.url));  
        }  
        if (pathname == '/tax-setting') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/setting/general/taxSetting`, req.url));  
        }  
        if (pathname == '/sms-setting') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/setting/general/sms`, req.url));  
        }  
        if (pathname == '/print-setting') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/setting/general/printSetting`, req.url));  
        }  
        if (pathname == '/organizations') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/admin/register/organization`, req.url));  
        }  
        if (pathname == '/dispensaries') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/admin/register/dispensary`, req.url));  
        }  
        if (pathname == '/users') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/admin/register/user`, req.url));  
        }  
        if (pathname == '/admins') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/admin/register/admin`, req.url));  
        }  
        if (pathname == '/import_Metrc') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/admin/register/import_Metrc`, req.url));  
        }  
        if (pathname == '/categories') {  
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeNameFromToken}/admin/register/itemCategory`, req.url));  
        }
        // URL Rewirte

        // URL Redirect
        if (pathname === '/signin') {
            return NextResponse.redirect(new URL(`/org/${orgNameFromToken}/${storeLinkName}/signin`, req.url));
        }

        if (decoded.userType !== 'SUPER_ADMIN_MANAGER_USER' && pathname.startsWith('/admin')) return NextResponse.redirect(new URL('/org/', req.url));
    } else {
        
        if (organizationId != undefined && storeLinkName != undefined && storeLinkName != 'org-access' && pageName !== 'signin') {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_REST_API_URL}/store?storeLinkName=${storeLinkName}&orgLinkName=${organizationId}`);
                const result = await response.json();

                if(result.store && result.org) {
                    return NextResponse.redirect(new URL(`/org/${organizationId}/${storeLinkName}/signin`, req.url));
                } else if (result.org) {
                    return NextResponse.redirect(new URL(`/org/${organizationId}/org-access`, req.url));
                } else {
                    // return NextResponse.redirect(new URL(`/org/${organizationId}/${storeLinkName}/invalidStoreLink`, req.url));
                    return NextResponse.rewrite(new URL(`/org/${organizationId}/${storeLinkName}/invalidStoreLink`, req.url));

                }
            }
            catch (error) {
                return NextResponse.rewrite(new URL(`/org/${organizationId}/${storeLinkName}/invalidStoreLink`, req.url));
            }
        }
    }
    // else 
    // {
    //     try {
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_REST_API_URL}/store?storeLinkName=${storeLinkName}&orgLinkName=${organizationId}`);
    //         const result = await response.json();

    //         if(result.store && result.org) {
    //             if (pageName === '/signin' || pageName === '' || pageName === undefined) {
    //                 return NextResponse.redirect(new URL(`/org/${organizationId}/${storeLinkName}/signin`, req.url));
    //             } else if (pathname === '/resetpass') {
    //                 return NextResponse.redirect(new URL(`/org/${organizationId}/${storeLinkName}/resetpass`, req.url));
    //             } 
    //         } else {
    //             return NextResponse.rewrite(new URL(`/org/${organizationId}/${storeLinkName}/invalidStoreLink`, req.url));
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }

    //     // if (!response.ok) {
    //     //   throw new Error(`HTTP error! status: ${response.status}`);
    //     // }
        
    // }
    // const response = NextResponse.next({
    //   request: {
    //     // New request headers
    //     headers: requestHeaders,
    //   },
    // })
    return res;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
