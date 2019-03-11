// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	projects: [
	  {
		runner: 'jest-runner-eslint',
		displayName: 'lint',
		testMatch: ['<rootDir>/src/*.ts', '<rootDir>/src/**/*.ts'],
		watchPlugins: ['jest-runner-eslint/watch-fix'],
	  },
	  {
		preset: 'ts-jest',
		displayName: 'test',
		clearMocks: true,
		collectCoverage: true,
		collectCoverageFrom: ['src/**/*.ts'],
		coverageDirectory: 'coverage',
		coverageReporters: ['lcov'],
		testEnvironment: 'node',
	  },
	],
  }