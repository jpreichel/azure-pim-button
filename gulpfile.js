import dotenv from 'dotenv';
import gulp from 'gulp';

import {
  bundle,
  clean,
  images,
  manifest,
  markup,
  scripts,
  styles,
  watch,
} from './tasks/index.js';

dotenv.config()

export const paths = {
  scripts: [
    'src/options.ts',
    'src/content.ts',
    'src/background.ts',
    'src/popup.ts',
  ],

  styles: [
    'src/options.scss',
    'src/popup.scss',
  ],

  images: 'src/images/**/*',

  manifest: 'src/manifest.json',

  markup: [
    'src/options.html',
    'src/popup.html',
  ],
}


gulp.task('build', gulp.series(clean, gulp.parallel(scripts, styles, markup, images, manifest)))
gulp.task('dev', gulp.series('build', watch))
gulp.task('bundle', gulp.series('build', bundle))
