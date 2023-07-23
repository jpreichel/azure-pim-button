import gulp from 'gulp';
import gulpif from 'gulp-if';
import jeditor from 'gulp-json-editor';

import { paths } from '../gulpfile.js';

function addAutoreloadScript(manifestJson) {
  const hasScripts = manifestJson.background && manifestJson.background.scripts

  return {
    ...manifestJson,
    background: {
      ...manifestJson.background,
      scripts: [ 'autoreload.js', ...(hasScripts ? manifestJson.background.scripts : []) ],
    },
  }
}

export function manifest(done) {
  gulp.src(paths.manifest)
    .pipe(gulpif(process.env.NODE_ENV === 'development', jeditor(addAutoreloadScript)))
    .pipe(gulp.dest('build'))

  done()
}
