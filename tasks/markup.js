import gulp from 'gulp';

import { paths } from '../gulpfile.js';

export function markup(done) {
  gulp.src(paths.markup, { allowEmpty: true, since: gulp.lastRun(markup) })
    .pipe(gulp.dest('build'))

  done()
}
