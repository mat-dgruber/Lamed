// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-puppeteer-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/angular-lamed'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    
    // Custom launcher for Puppeteer in a Docker/CI environment
    customLaunchers: {
      PuppeteerHeadlessNoSandbox: {
        base: 'Puppeteer',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--headless',
          '--remote-debugging-port=9222'
        ]
      }
    },
    browsers: ['PuppeteerHeadlessNoSandbox'],

    restartOnFileChange: true,
    singleRun: true,
    browserNoActivityTimeout: 100000
  });
};
