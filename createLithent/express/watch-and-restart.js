import { spawn } from 'child_process';
import chokidar from 'chokidar';

let serverProcess = spawn('node', ['--experimental-modules', 'server.js'], {
  stdio: 'inherit',
});

const watcher = chokidar.watch('src', {
  ignored: /(^|[\/\\])\../, // 숨김 파일 무시
  persistent: true,
});

let isInitialScanComplete = false;

// 감시 준비 완료 이벤트
watcher.on('ready', () => {
  isInitialScanComplete = true;
  console.log('Initial scan complete. Now watching for file changes...');
});

// 파일 추가 및 삭제 시만 반응 (초기 스캔 완료 후)
watcher.on('add', path => {
  if (isInitialScanComplete) {
    console.log(`File added: ${path}`);
    restartServer();
  }
});

watcher.on('unlink', path => {
  if (isInitialScanComplete) {
    console.log(`File removed: ${path}`);
    restartServer();
  }
});

function restartServer() {
  console.log('Restarting server...');
  serverProcess.kill();
  serverProcess = spawn('node', ['--experimental-modules', 'server.js'], {
    stdio: 'inherit',
  });
}
