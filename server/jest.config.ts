'use strict'
// import {compilerOptions} from './tsconfig.json'
// import  { pathsToModuleNameMapper } from 'ts-jest'

const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ["<rootDir>", "<rootDir>/src"],
    bail: true,
    testPathIgnorePatterns: ["<rootDir>/src/config/"],
    // moduleDirectories: ['.', 'node_modules'],
    moduleNameMapper: {
        "^@shared/(.*)$": "<rootDir>/../shared/src/$1",
        "^@models/(.*)$": "<rootDir>/src/models/$1",
        "^@config/(.*)$": "<rootDir>/src/config/$1",
        "^@cache/(.*)$": "<rootDir>/src/cache/$1"
    }
}

export default config