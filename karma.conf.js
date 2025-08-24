module.exports = function (config) {
  config.set({
    plugins: [
      'karma-jasmine',
      'karma-puppeteer-launcher',
    ],
    // Usaremos nosso launcher customizado
    browsers: ['PuppeteerHeadlessNoSandbox'],

    // Configuração customizada para rodar o Chrome Headless (via Puppeteer) dentro do Docker
    customLaunchers: {
      PuppeteerHeadlessNoSandbox: {
        base: 'Puppeteer',
        flags: [
          '--no-sandbox', // Essencial para rodar como root no Docker
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--headless',
          '--remote-debugging-port=9222'
        ]
      }
    },

    singleRun: true, // Executa os testes uma vez e sai
    browserNoActivityTimeout: 100000 // Aumenta o timeout para o navegador
  });
};
