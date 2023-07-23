import chalk from 'chalk';
import fancyLog from 'fancy-log';
import gulp from 'gulp';
import zip from 'gulp-zip';

import pkg from '../package.json' assert { type: 'json' };

function zipFiles(done) {
  gulp.src('build/**/*')
    .pipe(zip(`${pkg.name}.zip`))
    .pipe(gulp.dest('build'))

  done()
}

async function cleanZippedFiles() {
  return await deleteAsync(['build/*', '!build/*.zip'])
}

async function logBundle(done) {
  fancyLog()
  fancyLog(chalk.green(`Bundle successful!`))
  fancyLog(chalk.cyan(`The zip is ready to be published`))
  fancyLog()
  fancyLog(`  ${chalk.gray(`build/`)}${pkg.name}.zip`)
  fancyLog()
  done()
}

export const bundle = gulp.series(zipFiles, cleanZippedFiles, logBundle)
