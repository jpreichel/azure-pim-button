import chalk from 'chalk';
import fancyLog from 'fancy-log';
import gulp from 'gulp';
import { Server } from 'socket.io';

import { paths } from '../gulpfile.js';
import {
  images,
  manifest,
  markup,
  scripts,
  styles,
} from './index.js';

const io = new Server();

export function watch() {
  const server = io.listen(process.env.WEBSOCKET_PORT, { transports: ['websocket', 'polling', 'flashsocket'] })
  let socket
  server.on('connection', (newSocket) => { socket = newSocket })

  async function triggerFileChange() {
    socket.emit('file changed', () => {
      fancyLog(chalk.yellow(`Extension reloaded!`))
    })
  }

  gulp.watch('src/**/*.ts', gulp.series(scripts, triggerFileChange))
  gulp.watch('src/**/*.scss', gulp.series(styles, triggerFileChange))
  gulp.watch(paths.manifest, gulp.series(manifest, triggerFileChange))
  gulp.watch(paths.images, gulp.series(images, triggerFileChange))
  gulp.watch(paths.markup, gulp.series(markup, triggerFileChange))

  fancyLog()
  fancyLog(chalk.green(`Compiled successfully!`))
  fancyLog(chalk.cyan(`To load the unpacked extension and start the ${chalk.bold(`autoreload`)}:`))
  fancyLog()
  fancyLog(`  1. Go to ${chalk.underline.bold(`chrome://extensions/`)}`)
  fancyLog(`  2. Make sure ${chalk.bold(`Developer mode`)} is on`)
  fancyLog(`  3. Click ${chalk.bold(`Load unpacked`)} and choose the ${chalk.bold(`build/`)} folder`)
  fancyLog()
}
