import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      container: {
        center: true,
      },
      fontSize: {
        xs: "12px",
      },
      lineHeight: {
        4: "16px",
        8: "24px",
      },
      colors: {
        black: {
          default: "#111",
        },
        gray: {
          200: "#1B1B1B",
          400: "#303030",
          600: "#606060",
          11: "#B1B1B1",
          12: "#EEE",
        },
      },
    },
  },
  plugins: [require("daisyui")],
};
export default config;
