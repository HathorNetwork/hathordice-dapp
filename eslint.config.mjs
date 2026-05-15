import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    ignores: [
      '.next/**',
      'out/**',
      'coverage/**',
      'dist/**',
      'build/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
];

export default config;