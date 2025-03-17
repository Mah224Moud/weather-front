module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    transform: {
      '^.+\\.(ts|html)$': 'ts-jest',
    },
    testEnvironment: 'jsdom',
    testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  };
  