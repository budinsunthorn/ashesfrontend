/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');
const rotateX = plugin(function ({ addUtilities }) {
    addUtilities({
        '.rotate-y-180': {
            transform: 'rotateY(180deg)',
        },
    });
});

const colours = ['lime', 'red', 'cyan', 'green', 'gray', 'amber', 'blue'];

const safeColours = colours.flatMap((color) => [`bg-${color}-100`, `dark:bg-${color}-900`, `text-${color}-800`, `dark:text-${color}-300`]);

module.exports = {
    content: ['./App.tsx', './app/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    safelist: [...safeColours],
    theme: {
        fontFamily: {
            roboto: 'var(--roboto-font)',
            bitter: 'var(--bitter-font)',
            montserrat: 'var(--montserrat-font)',
            open_Sans: 'var(--open_Sans-font)',
            poppins: 'var(--poppins-font)',
            varela_Round: 'var(--varela_Round-font)',
            kameron: 'var(--kameron-font)',
            lato: 'var(--lato-font)',
            ultra: 'var(--ultra-font)',
        },
        container: {
            center: true,
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4361ee',
                    light: '#eaf1ff',
                    dark: '#1b2865',
                    'dark-light': 'rgba(67,97,238,.15)',
                },
                secondary: {
                    DEFAULT: '#805dca',
                    light: '#ebe4f7',
                    dark: '',
                    'dark-light': 'rgb(128 93 202 / 15%)',
                },
                success: {
                    DEFAULT: '#00ab55',
                    light: '#ddf5f0',
                    dark: '',
                    'dark-light': 'rgba(0,171,85,.15)',
                },
                danger: {
                    DEFAULT: '#e7515a',
                    light: '#fff5f5',
                    dark: '',
                    'dark-light': 'rgba(231,81,90,.15)',
                },
                warning: {
                    DEFAULT: '#e2a03f',
                    light: '#fff9ed',
                    dark: '#4a3312',
                    'dark-light': 'rgba(226,160,63,.15)',
                },
                info: {
                    DEFAULT: '#2196f3',
                    light: '#e7f7ff',
                    dark: '',
                    'dark-light': 'rgba(33,150,243,.15)',
                },
                dark: {
                    DEFAULT: '#3b3f5c',
                    light: '#eaeaec',
                    dark: '',
                    'dark-light': 'rgba(59,63,92,.15)',
                },
                black: {
                    DEFAULT: '#0e1726',
                    medium: '#17263c',
                    light: '#e3e4eb',
                    'dark-light': 'rgba(14,23,38,.15)',
                },
                white: {
                    DEFAULT: '#ffffff',
                    light: '#e0e6ed',
                    dark: '#888ea8',
                },
                theme_green: {
                    DEFAULT: '#5CB58C',
                    light: '#5CB58C',
                    dark: '#1d392c',
                },
            },
            fontFamily: {
                nunito: ['var(--font-nunito)'],
            },
            spacing: {
                4.5: '18px',
            },
            boxShadow: {
                '3xl': '0 2px 2px rgb(224 230 237 / 46%), 1px 6px 7px rgb(224 230 237 / 46%)',
            },
            typography: ({ theme }) => ({
                DEFAULT: {
                    css: {
                        '--tw-prose-invert-headings': theme('colors.white.dark'),
                        '--tw-prose-invert-links': theme('colors.white.dark'),
                        h1: { fontSize: '40px', marginBottom: '0.5rem', marginTop: 0 },
                        h2: { fontSize: '32px', marginBottom: '0.5rem', marginTop: 0 },
                        h3: { fontSize: '28px', marginBottom: '0.5rem', marginTop: 0 },
                        h4: { fontSize: '24px', marginBottom: '0.5rem', marginTop: 0 },
                        h5: { fontSize: '20px', marginBottom: '0.5rem', marginTop: 0 },
                        h6: { fontSize: '16px', marginBottom: '0.5rem', marginTop: 0 },
                        p: { marginBottom: '0.5rem' },
                        li: { margin: 0 },
                        img: { margin: 0 },
                    },
                },
            }),
            animation: {
                gradient: 'gradient 5s ease infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center',
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center',
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
        require('@tailwindcss/typography'),
        rotateX,
    ],
};
