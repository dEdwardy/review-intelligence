const config = {
  '*.{js,jsx,mjs}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{json,md,css}': ['prettier --write'],
  '*.svg': ['prettier --write --ignore-unknown'],
};

export default config;
