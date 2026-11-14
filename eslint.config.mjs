import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ["readtheplaces-source/**"]
  }
];

export default eslintConfig;
