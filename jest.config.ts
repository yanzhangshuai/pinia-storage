import { InitialOptionsTsJest } from 'ts-jest';

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.{test,spec}.ts'],
  transform: {
    '^.+\\.[jt]s?$': 'ts-jest',
  }
};

export default config;