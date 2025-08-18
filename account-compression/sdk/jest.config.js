module.exports = {
    preset: 'ts-jest/presets/default',
    testEnvironment: 'node',
    testTimeout: 100000,
    resolver: 'ts-jest-resolver',
    // Only run TypeScript test files, ignore compiled JS files
    testMatch: ['**/*.test.ts'],
    // Explicitly ignore dist directory
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
