import ProviderComponent from '@/components/layouts/factors/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import '../styles/index.css';
import { Metadata } from 'next';
import {Provider} from 'jotai'
import { Nunito, Roboto, Bitter, Montserrat, Open_Sans, Poppins, Varela_Round, Kameron, Lato, Ultra } from 'next/font/google';

export const metadata: Metadata = {
    title: {
        template: '%s | AshesPOS - Cannabis POS System',
        default: 'AshesPOS - Cannabis POS System',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});
const roboto = Roboto({
    variable: '--roboto-font',
    weight: ['100', '300', '400', '500', '700', '900'],
    subsets: ['latin'],
});
const bitter = Bitter({
    variable: '--bitter-font',
    weight: ['100', '300', '400', '500', '700', '900'],
    subsets: ['latin'],
});

const montserrat = Montserrat({
    variable: '--montserrat-font',
    weight: ['100', '300', '400', '500', '700', '900'],
    subsets: ['latin'],
});

const open_Sans = Open_Sans({
    variable: '--open_Sans-font',
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
});

const poppins = Poppins({
    variable: '--poppins-font',
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
});

const kameron = Kameron({
    variable: '--kameron-font',
    weight: ['400'],
    subsets: ['latin'],
});

const varela_Round = Varela_Round({
    variable: '--varela_Round-font',
    weight: ['400'],
    subsets: ['latin'],
});

const lato = Lato({
    variable: '--lato-font',
    weight: ['400'],
    subsets: ['latin'],
});
const ultra = Ultra({
    variable: '--ultra-font',
    weight: ['400'],
    subsets: ['latin'],
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang="en">
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <body
                className={`${nunito.variable} ${roboto.variable} ${bitter.variable} ${montserrat.variable} ${open_Sans.variable} ${poppins.variable} ${varela_Round.variable} ${kameron.variable} ${lato.variable} ${ultra.variable}`}
            >
                <Provider>
                    <ProviderComponent>{children}</ProviderComponent>
                </Provider>
            </body>
        </html>
    );
}

export default RootLayout;