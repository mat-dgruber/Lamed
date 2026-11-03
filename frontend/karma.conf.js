module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
    ],
    reporters: ['progress', 'coverage'],
    browsers: ['ChromeHeadless'],
    singleRun: true,
    coverageReporter: {
      check: {
        global: {
          statements: 56,
          branches: 36,
          functions: 47,
          lines: 57,
        },
      },
    },
  });
};
