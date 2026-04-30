// 전역 색상 변수 저장
let currentHairColor = '#000000';
let currentBodyColor = '#ffffff';
let currentBody2Color = '#ffffff';

// --- 초기화 ---
document.addEventListener("DOMContentLoaded", () => {
  // 처음 로드될 때 색상 초기화
  colorizeHair();
  colorizeBody();
  
  // 컬러 피커 이벤트 리스너 등록
  const colorPicker = document.getElementById('hair-color');
  colorPicker.addEventListener('input', (e) => {
    currentHairColor = e.target.value;
    colorizeHair();
  });

  const bodyColorPicker = document.getElementById('body-color');
  bodyColorPicker.addEventListener('input', (e) => {
    currentBodyColor = e.target.value;
    colorizeBody();
  });

  const body2ColorPicker = document.getElementById('body2-color');
  body2ColorPicker.addEventListener('input', (e) => {
    currentBody2Color = e.target.value;
    colorizeBody();
  });

  // 대사창 아무 곳이나 클릭해도 텍스트 입력 상태(커서 깜빡임)가 되도록 설정
  const speechBox = document.querySelector('.speech-box');
  const speechInput = document.getElementById('result-speech-input');
  if (speechBox && speechInput) {
    speechBox.addEventListener('click', (e) => {
      // 텍스트를 클릭한게 아닐 때만 강제로 포커스
      if (e.target !== speechInput) {
        speechInput.focus();
      }
    });

    speechInput.addEventListener('focus', function() {
      if (this.innerText.trim() === '대사를 입력하세요') {
        this.innerText = '';
      }
    });

    speechInput.addEventListener('blur', function() {
      if (this.innerText.trim() === '') {
        this.innerText = '대사를 입력하세요';
      }
    });
  }
});

function colorizeBody() {
  const bodyImg = document.getElementById('preview-body1');
  if (bodyImg && bodyImg.dataset.baseSrc) {
    applyColorToImage(bodyImg.dataset.baseSrc, currentBodyColor, 'preview-body1');
  }

  const body2Img = document.getElementById('preview-body2');
  if (body2Img && body2Img.dataset.baseSrc) {
    applyColorToImage(body2Img.dataset.baseSrc, currentBody2Color, 'preview-body2');
  }
}

function colorizeHair() {
  const hairImg = document.getElementById('preview-hair');
  if (hairImg.dataset.baseSrc) {
    applyColorToImage(hairImg.dataset.baseSrc, currentHairColor, 'preview-hair');
  }

  const addhairImg = document.getElementById('preview-addhair');
  if (addhairImg.dataset.baseSrc && addhairImg.style.display !== 'none') {
    applyColorToImage(addhairImg.dataset.baseSrc, currentHairColor, 'preview-addhair');
  }
}

// 캔버스를 사용하여 이미지 색상 입히기 (mix-blend-mode 대용)
function applyColorToImage(imageSrc, color, imgElementId) {
  if (!imageSrc) return;
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    // 1. 원본 이미지 그리기
    ctx.drawImage(img, 0, 0);
    
    // 2. 색상 곱하기 (Multiply)
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 3. 원래 투명도(알파 채널) 마스킹 유지
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(img, 0, 0);
    
    // 생성된 이미지를 <img> 태그 src에 덮어씌움
    const targetImg = document.getElementById(imgElementId);
    if(targetImg) {
       targetImg.src = canvas.toDataURL('image/png');
    }
  };
  img.src = imageSrc;
}

// --- 파츠 변경 함수 ---
function changePart(type, imageSrc, btnElement) {
  if (type === 'hair') {
    const hairImg = document.getElementById('preview-hair');
    hairImg.dataset.baseSrc = imageSrc;
    applyColorToImage(imageSrc, currentHairColor, 'preview-hair');
  } else if (type === 'addhair') {
    const addhairImg = document.getElementById('preview-addhair');
    if (imageSrc === '') {
      addhairImg.style.display = 'none';
      addhairImg.dataset.baseSrc = '';
    } else {
      addhairImg.style.display = 'block';
      addhairImg.dataset.baseSrc = imageSrc;
      applyColorToImage(imageSrc, currentHairColor, 'preview-addhair');
    }
  } else if (type === 'face') {
    const faceImg = document.getElementById('preview-face');
    faceImg.src = imageSrc;
  } else if (type === 'mouth') {
    const mouthImg = document.getElementById('preview-mouth');
    mouthImg.src = imageSrc;
  }

  const grid = btnElement.parentElement;
  const slots = grid.querySelectorAll('.slot');
  slots.forEach(slot => slot.classList.remove('active'));
  btnElement.classList.add('active');
}
// --- 결과창 스케일 조절 ---
function adjustScale() {
  const wrapper = document.getElementById('capture-wrapper');
  const captureArea = document.getElementById('capture-area');
  if (!wrapper || !captureArea) return;

  // 브라우저 창 너비에서 양옆 여백(약 40px)을 뺀 사용 가능 너비 계산
  const availableWidth = window.innerWidth - 40;
  const targetWidth = 853;

  if (availableWidth < targetWidth) {
    const scale = availableWidth / targetWidth;
    captureArea.style.transform = `scale(${scale})`;
    // 래퍼의 높이도 스케일에 맞춰 줄여주어 아래 여백이 생기지 않게 함
    wrapper.style.height = `${480 * scale}px`;
  } else {
    captureArea.style.transform = 'scale(1)';
    wrapper.style.height = '480px';
  }
}

// 윈도우 크기 변경 시 스케일 자동 조절
window.addEventListener('resize', adjustScale);


// --- 화면 전환 (에디터 -> 결과) ---
function goToResult() {
  document.getElementById('editor-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');

  // 화면이 표시될 때 스케일 한 번 계산
  adjustScale();

  const preview = document.getElementById('character-preview');
  const result = document.getElementById('result-character');
  result.innerHTML = preview.innerHTML;

  // 이름 텍스트 복사
  const nameInput = document.getElementById('character-name').value;
  const nameDisplay = document.getElementById('result-name-display');
  if (nameDisplay) {
    nameDisplay.textContent = nameInput;
  }
}

// --- 화면 전환 (결과 -> 에디터) ---
function goToEditor() {
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('editor-screen').classList.remove('hidden');
}


// --- 이미지 저장 (html2canvas 사용) ---
function saveImage() {
  const captureArea = document.getElementById('capture-area');
  const retroOverlay = document.getElementById('retro-overlay');
  const resultCharacter = document.getElementById('result-character');
  
  // 캡쳐 직전에 시각적 스케일을 강제로 풀어서 고화질(원본 비율)로 캡쳐되도록 함
  const originalTransform = captureArea.style.transform;
  captureArea.style.transform = 'scale(1)';

  // CSS 오버레이와 라이브 프리뷰 효과 숨김 (JS로 완벽하게 픽셀 합성하기 위함)
  if (retroOverlay) retroOverlay.style.display = 'none';
  const originalFilter = resultCharacter.style.filter;
  resultCharacter.style.filter = 'none';

  html2canvas(captureArea, {
    backgroundColor: null,
    scale: 2 // 고해상도 옵션
  }).then(canvas => {
    // 캡쳐 완료 후 스케일 및 CSS 효과 복구
    captureArea.style.transform = originalTransform;
    if (retroOverlay) retroOverlay.style.display = 'block';
    resultCharacter.style.filter = originalFilter;

    // --- 픽셀레이트(Pixelate) 효과 ---
    const pixelBlockSize = 2; // 픽셀 크기 줄임 (3 -> 2)
    const tempCanvas = document.createElement('canvas');
    const w = canvas.width;
    const h = canvas.height;
    tempCanvas.width = Math.floor(w / pixelBlockSize);
    tempCanvas.height = Math.floor(h / pixelBlockSize);
    const tCtx = tempCanvas.getContext('2d');
    
    // 작게 그려서 정보 날리기
    tCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // 부드러운 처리(스무딩)를 끄고 원래 크기로 확대
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); // html2canvas가 남긴 스케일 확대 버그 방지 (확대되는 문제 해결)
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tempCanvas, 0, 0, w, h);

    // --- 노이즈, 1px 색 수차, 가로선(Scanlines) 포스트 프로세싱 ---
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const copyData = new Uint8ClampedArray(data);

    // 색수차: 요청하신 1px만 이동 (scale이 2이므로 실제 캔버스에서는 2픽셀 이동)
    const offsetR = -1 * 2 * 4; // Red 채널 1픽셀(x2) 왼쪽
    const offsetB = 1 * 2 * 4;  // Blue 채널 1픽셀(x2) 오른쪽

    for (let y = 0; y < h; y++) {
      // 스캔라인(가로선) 어둡게 처리 (scale이 2이므로 4픽셀 주기로 2픽셀씩 어둡게)
      const isScanline = (y % 4) < 2;

      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        
        // 투명하지 않은 픽셀에만 적용
        if (copyData[i + 3] > 0) {
          // 색 수차 (Red Shift)
          const iR = i + offsetR;
          if (iR >= 0 && iR < data.length && Math.floor(iR / (w * 4)) === y) {
            data[i] = copyData[iR];
          }
          
          // 색 수차 (Blue Shift)
          const iB = i + offsetB;
          if (iB >= 0 && iB < data.length && Math.floor(iB / (w * 4)) === y) {
            data[i + 2] = copyData[iB + 2];
          }

          // 노이즈 강도
          let noise = (Math.random() - 0.5) * 15; 

          // 스캔라인 적용 (가로선 영역이면 RGB 값을 어둡게)
          if (isScanline) {
            noise -= 25; // 25만큼 어둡게
          }

          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
          data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
    // --------------------------------------------------------

    const imageUrl = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'my-character.png';
    link.click();
  }).catch(error => {
    captureArea.style.transform = originalTransform;
    if (retroOverlay) retroOverlay.style.display = 'block';
    resultCharacter.style.filter = originalFilter;
    console.error('이미지 저장 중 오류 발생:', error);
    alert('이미지를 저장하는 데 실패했습니다.');
  });
}
