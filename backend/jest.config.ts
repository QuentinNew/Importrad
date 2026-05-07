import type { Config } from 'jest';

const config: Config = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      rootDir: './src',
      testRegex: '.*\\.spec\\.ts$',
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
      moduleFileExtensions: ['js', 'json', 'ts'],
      collectCoverageFrom: ['**/*.(t|j)s'],
      coverageDirectory: '../coverage',
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      rootDir: '.',
      testRegex: 'test/.*\\.integration\\.spec\\.ts$',
      transform: { '^.+\\.(t|j)s$': 'ts-jest' },
      moduleFileExtensions: ['js', 'json', 'ts'],
      setupFiles: ['<rootDir>/test/setup-env.ts'],
    },
  ],
};

export default config;
