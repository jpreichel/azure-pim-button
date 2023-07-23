import gulp from 'gulp';

import { paths } from '../gulpfile.js';

export function images(done) {
  gulp.src(paths.images, { since: gulp.lastRun(images) })
    .pipe(gulp.dest('build/images'))

  done()
}
