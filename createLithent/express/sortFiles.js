// 첫 번째 _가 나온 인덱스를 찾는 함수
function findUnderscoreIndex(file) {
  const splitFile = file.split('.');
  return splitFile.findIndex(part => part.startsWith('_'));
}

// 첫 번째 _가 포함된 항목과 포함되지 않은 항목을 그룹으로 분리하는 함수
function separateByUnderscore(files) {
  const underscoreFiles = [];
  const nonUnderscoreFiles = [];

  files.forEach(file => {
    if (file.includes('_')) {
      underscoreFiles.push(file);
    } else {
      nonUnderscoreFiles.push(file);
    }
  });

  return { underscoreFiles, nonUnderscoreFiles };
}

// 첫 번째 _가 나온 위치를 기준으로 정렬하는 함수
function customSort(files) {
  const n = files.length;

  // 선택 정렬 방식으로 구현
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const fileI = files[i];
      const fileJ = files[j];

      const splitFileI = fileI.split('.');
      const splitFileJ = fileJ.split('.');

      const underscoreIndexI = findUnderscoreIndex(fileI);
      const underscoreIndexJ = findUnderscoreIndex(fileJ);

      // 첫 번째 _가 앞에 있는 항목이 더 뒤로 가야 하므로 교환
      if (underscoreIndexI < underscoreIndexJ) {
        [files[i], files[j]] = [files[j], files[i]];
      } else if (underscoreIndexI === underscoreIndexJ) {
        // 길이가 더 긴 배열이 앞에 오도록 교환
        if (splitFileJ.length > splitFileI.length) {
          [files[i], files[j]] = [files[j], files[i]];
        }
      }
    }
  }
}

// 그룹화 후 정렬하는 함수
export default function sortFiles(files) {
  const { underscoreFiles, nonUnderscoreFiles } = separateByUnderscore(files);

  // 각 그룹 내에서 정렬
  customSort(nonUnderscoreFiles);
  customSort(underscoreFiles);

  // 언더바가 포함된 항목은 뒤로 배치
  return [...nonUnderscoreFiles, ...underscoreFiles];
}
