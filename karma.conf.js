module.exports = function (config) {
  config.set({
    plugins: [
      'karma-jasmine',
      'karma-puppeteer-launcher',
    ],
    browsers: ['Puppeteer']
  });
};
