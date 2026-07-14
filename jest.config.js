export default {
  testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
  transform: {
    '^.+\\.tsx?$': '<rootDir>/tools/jest-ts-transform.cjs'
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\./|\\.\\./)(.+)\\.js$': '$1$2'
  }
};
