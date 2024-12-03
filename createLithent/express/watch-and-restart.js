import { spawn } from 'child_process';
import chokidar from 'chokidar';

let serverProcess = spawn('node', ['--experimental-modules', 'server.js'], {
  stdio: 'inherit',
});

// server.js 파일 수정 감시
const serverWatcher = chokidar.watch('server.js', {
  ignored: /(^|[\/\\])\../, // 숨김 파일 무시
  persistent: true,
});

// src 디렉토리에서 파일 추가/삭제 감시
const srcWatcher = chokidar.watch('src', {
  ignored: /(^|[\/\\])\../, // 숨김 파일 무시
  persistent: true,
});

let isSrcInitialScanComplete = false;

// src 디렉토리 초기 스캔 완료 후 감시 시작
srcWatcher.on('ready', () => {
  isSrcInitialScanComplete = true;
  console.log(
    'Initial scan complete for src. Now watching for file additions and deletions...'
  );
});

// src 디렉토리 파일 추가/삭제 감지
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

// server.js 수정 감지
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
