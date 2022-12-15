module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'operator-linebreak': [
      'error',
      'after',
      {
        overrides: {
          ':': 'before',
          '?': 'before',
        },
      },
    ],
    'max-len': ['error', { code: 120 }],
  },
  'import/resolver': {
    'node': {
      'extensions': ['.js', '.jsx', '.ts', '.tsx']
    }
  }
};
