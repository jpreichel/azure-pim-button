import Dotenv from 'dotenv-webpack';
import gulp from 'gulp';
import addSrc from 'gulp-add-src';
import gulpif from 'gulp-if';
import named from 'vinyl-named';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';

import { paths } from '../gulpfile.js';

const webpackConfig = {
  mode: process.env.NODE_ENV,
  devtool: 'source-map',
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  // use automatically in your code process.env.NODE_ENV
  // and all of the other env variables
  plugins: [
    new Dotenv({ systemvars: true }),
  ],
  // import files without doing the ../../../
  resolve: {
    modules: ['node_modules', 'src'],
  },
  // only log errors to console,
  // gulp handles the rest
  stats: 'errors-only',
  // disable webpack's default behavior, which is
  // targeted to web applications development
  performance: false,
  optimization: {
    splitChunks: false,
  },
}

export function scripts(done) {
  gulp.src(paths.scripts, { allowEmpty: true })
    .pipe(gulpif(process.env.NODE_ENV === 'development', addSrc('utils/autoreload.js')))
    .pipe(named())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest('build'))

  done()
}
