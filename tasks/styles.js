import gulp from 'gulp';
import notify from 'gulp-notify';
import postcss from 'gulp-postcss';
import gulpSass from 'gulp-sass';
import postcssPresetEnv from 'postcss-preset-env';
import dartSass from 'sass';
import moduleImporter from 'sass-module-importer';

import { paths } from '../gulpfile.js';

const sass = gulpSass(dartSass)

export function styles(done) {
  gulp.src(paths.styles, { allowEmpty: true, sourcemaps: true })
    .pipe(
      sass({
        // compile to expanded css because
        // this is a browser extension
        outputStyle: 'expanded',
        // import scss from node_modules
        importer: moduleImporter(),
        includePaths: 'node_modules/',
      })
    )
    .on('error', notify.onError({
      title: 'Error compiling sass!',
    }))
    .pipe(
      postcss([
        // autoprefixer for the browserslist in package.json
        // and other futuristic css features
        postcssPresetEnv({ stage: -1 }),
      ])
    )
    .on('error', notify.onError({
      title: 'Error compiling postcss!',
    }))
    .pipe(gulp.dest('build', { sourcemaps: '.' }))

  done()
}
