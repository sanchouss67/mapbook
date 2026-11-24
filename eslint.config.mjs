import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ["readtheplaces-source/**", ".next-build/**"]
  }
];

export default eslintConfig;
