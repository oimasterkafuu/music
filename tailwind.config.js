/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    safelist: [
        {
            pattern: /opacity-*/
        },
        {
            pattern: /blur-*/
        }
    ],
    theme: {
        extend: {}
    },
    plugins: []
};
