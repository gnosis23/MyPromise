// Karma configuration
var webpack = require('webpack')
var path = require('path')

var webpackConfig = {
  mode: 'development',
  resolve: {
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    })
  ],
  devtool: '#inline-source-map'
}

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'test/*.js'
    ],

    preprocessors: {
      'test/*.js': ['webpack']
    },

        // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome','Firefox','IE'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true
    }
  });
};