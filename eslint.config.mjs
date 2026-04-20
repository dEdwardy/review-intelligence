import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: ['.next/**', '.vercel/**', 'coverage/**', 'node_modules/**'],
  },
  ...nextCoreWebVitals,
];

export default config;
