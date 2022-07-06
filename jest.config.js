const {defaults} = require('jest-config');
module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js'],

  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '@/(.*)': ['<rootDir>/src/$1'],
    '@test/(.*)': ['<rootDir>/test/$1'],
  },
};
