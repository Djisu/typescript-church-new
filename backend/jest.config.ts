




// // jest.config.mjs
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '\\.(css|less|scss)$': 'identity-obj-proxy',
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    coverageDirectory: 'coverage',
    collectCoverage: true,
};







// module.exports = {
//     preset: 'ts-jest',
//     testEnvironment: 'node',
//     moduleFileExtensions: ['ts', 'js', 'json', 'node'],
//     testMatch: ['**/__tests__/**/*.(test|spec).ts'],
//     transform: {
//         '^.+\\.ts$': 'ts-jest',
//     },
//     coverageDirectory: 'coverage',
//     collectCoverage: true,
// };

