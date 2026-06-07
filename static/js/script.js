 let model = null;
let stream = null;
let animationId = null;
let isRunning = false;

const video    = document.getElementById('video');
const overlay  = document.getElementById('overlay');
const loadingScreen = document.getElementById('loadingScreen');
const ctx      = overlay.getContext('2d');
const statusDot  = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const startBtn   = document.getElementById('startBtn');
const stopBtn    = document.getElementById('stopBtn');
const idleScreen = document.getElementById('idleScreen');
const scanLine   = document.getElementById('scanLine');
const detList    = document.getElementById('detectionsList');

// Sets  UI status message and dot color
function setStatus(msg, active = false) {
  statusText.textContent = msg;
  statusDot.classList.toggle('active', active);
}

// Main function to start detection
async function startDetection() {
  // Disable start button
  startBtn.disabled = true;
  
  // Show loading screen, hide idle screen
  idleScreen.style.display = 'none';
  loadingScreen.style.display = 'flex';        
  setStatus('Loading AI model...'); // Update status message
  
  // Load model once
  if (!model) {
    try {
      model = await window.cocoSsd.load();
    } catch (e) {
      setStatus('Failed to load model. Check connection.');
      startBtn.disabled = false;
      return;
    }
  }

  // Request camera
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
  } catch (e) {
    setStatus('Camera access denied. Please allow camera permissions.');
    startBtn.disabled = false;
    return;
  }

  video.srcObject = stream;

  video.onloadedmetadata = () => {
    // Hide loading screen, show video and controls
    loadingScreen.style.display = 'none';     
    video.style.display = 'block';
    idleScreen.style.display = 'none';
    loadingScreen.style.display = 'none';
    stopBtn.style.display = 'block';
    startBtn.style.display = 'none';
    scanLine.style.display = 'block';

    isRunning = true;
    setStatus('Detecting objects…', true);
    detectLoop();
  };
  
  
}

// Detects objects in the video stream and updates the UI
async function detectLoop() {
  if (!isRunning) return;

  // Sync canvas size to video
  if (video.videoWidth > 0) {
    overlay.width  = video.videoWidth;
    overlay.height = video.videoHeight;
  }

  ctx.clearRect(0, 0, overlay.width, overlay.height);

  let predictions = [];
  try {
    predictions = await model.detect(video);
  } catch (e) {
    // silently continue
  }

  drawBoxes(predictions);
  updateDetectionTags(predictions);

  animationId = requestAnimationFrame(detectLoop);
}

// Draws bounding boxes and labels on the canvas for each detected object
function drawBoxes(predictions) {
  predictions.forEach(pred => {
    const [x, y, w, h] = pred.bbox;
    const conf = Math.round(pred.score * 100);
    const label = `${pred.class} ${conf}%`;

    // Box
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth   = 2;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur  = 8;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur  = 0;

    // Label background
    ctx.font = 'bold 13px Space Mono, monospace';
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(0,229,255,0.85)';
    ctx.fillRect(x, y - 22, tw + 10, 22);

    // Label text
    ctx.fillStyle = '#000';
    ctx.fillText(label, x + 5, y - 6);
  });
}

// Updates the list of detected objects
function updateDetectionTags(predictions) {
  if (predictions.length === 0) {
    detList.innerHTML = '<span class="no-detections">No objects detected in frame</span>';
    return;
  }

  // Keep highest confidence
  const best = {};
  predictions.forEach(prediction => {
    if (!best[prediction.class] || prediction.score > best[prediction.class]) best[prediction.class] = prediction.score;
  });

  detList.innerHTML = Object.entries(best)
    .sort((a, b) => b[1] - a[1])
    .map(([cls, score]) =>
      `<div class="detection-tag">
        ${cls}
        <span class="detection-conf">${Math.round(score * 100)}%</span>
      </div>`
    ).join('');
}

// Stops the detection loop, releases camera, and resets the UI
function stopDetection() {
  isRunning = false;
  if (animationId) cancelAnimationFrame(animationId);
  if (stream) stream.getTracks().forEach(t => t.stop());

  video.style.display  = 'none';
  idleScreen.style.display = 'flex';
  stopBtn.style.display = 'none';
  startBtn.style.display = 'block';
  startBtn.disabled = false;
  scanLine.style.display = 'none';

  ctx.clearRect(0, 0, overlay.width, overlay.height);
  detList.innerHTML = '<span class="no-detections">No detections yet</span>';
  setStatus('Stopped. Click START to begin again');
}

// Attach event listeners to buttons
startBtn.addEventListener('click', startDetection);
stopBtn.addEventListener('click', stopDetection);