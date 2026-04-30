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


// --- 화면 전환 (에디터 -> 결과) ---
function goToResult() {
  // 프리뷰 영역의 캐릭터 HTML을 결과 화면으로 복사
  const previewHtml = document.getElementById('character-preview').innerHTML;
  document.getElementById('result-character').innerHTML = previewHtml;

  // 화면 전환 (에디터 숨기고, 결과 보이기)
  document.getElementById('editor-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');
}

// --- 화면 전환 (결과 -> 에디터) ---
function goToEditor() {
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('editor-screen').classList.remove('hidden');
}


// --- 이미지 저장 (html2canvas 사용) ---
function saveImage() {
  const captureArea = document.getElementById('capture-area');
  
  // html2canvas를 사용하여 captureArea를 캔버스로 변환
  html2canvas(captureArea, {
    backgroundColor: '#FFD13B', // 캡쳐 시 배경색 강제 지정
    scale: 2 // 고해상도로 캡쳐
  }).then(canvas => {
    // 캔버스를 이미지 URL로 변환
    const imageUrl = canvas.toDataURL("image/png");
    
    // 가상의 a 태그를 만들어 다운로드 실행
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'my-character.png'; // 저장될 파일 이름
    link.click();
  }).catch(error => {
    console.error('이미지 저장 중 오류 발생:', error);
    alert('이미지를 저장하는 데 실패했습니다.');
  });
}
