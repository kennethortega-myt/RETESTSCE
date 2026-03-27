// karma.conf.js
module.exports = function karmaConfig(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // Puedes configurar opciones de Jasmine aquí
        // random: false,
      },
      clearContext: false // Para que el reporte HTML de Jasmine se mantenga visible
    },
    coverageReporter: {
      dir: require('node:path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'lcovonly' },  // Muy importante para SonarScanner
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'], // Usa Chrome en modo headless para CI o sin UI
    singleRun: false,
    restartOnFileChange: true
  });
};