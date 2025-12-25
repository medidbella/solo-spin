export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        solo: ["SoloLeveling", "serif"],
        teachers: ["Teachers", "sans-serif"],
      },
      colors: {
        soloblue: "#2A3FA1",      // The bright blue button/icon color
        darkerpurple: '#0F0317',  // The main background color
        solopurple: '#5F3779',    // The shadow/border purple
        solowhite: '#f2f2f2',     // The text color
        solodark: '#441563',      // The deep purple used for shadows/text
      },
      boxShadow: {
        'solo-card': '-10px -10px 0px #441563',
        'solo-btn': '5px -5px 0px #441563',
      },
    },
  },
  plugins: [],
};
