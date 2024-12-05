import { spawn } from 'child_process';
import chokidar from 'chokidar';

let serverProcess = spawn('node', ['--experimental-modules', 'server.js'], {
  stdio: 'inherit',
});

const serverWatcher = chokidar.watch('server.js', {
  ignored: /(^|[\/\\])\../, // 숨김 파일 무시
  persistent: true,
});

const srcWatcher = chokidar.watch('src', {
  ignored: /(^|[\/\\])\../, // 숨김 파일 무시
  persistent: true,
});

let isSrcInitialScanComplete = false;

srcWatcher.on('ready', () => {
  isSrcInitialScanComplete = true;
  console.log(
    'Initial scan complete for src. Now watching for file additions and deletions...'
  );
});

srcWatcher.on('add', path => {
  if (isSrcInitialScanComplete) {
    console.log(`File added in src: ${path}`);
  }
});

srcWatcher.on('unlink', path => {
  if (isSrcInitialScanComplete) {
    console.log(`File removed from src: ${path}`);
  }
});

serverWatcher.on('change', path => {
  console.log(`File changed: ${path}`);
  restartServer();
});

function restartServer() {
  console.log('Restarting server...');
  serverProcess.kill();
  serverProcess = spawn('node', ['--experimental-modules', 'server.js'], {
    stdio: 'inherit',
  });
}
