import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: [
    "./index.html",
    './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}',
    'node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom': '0px 0px 10px 0px rgba(0,0,0,0.85), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
});