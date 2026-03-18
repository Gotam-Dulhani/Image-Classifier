const MODEL_URL = "https://teachablemachine.withgoogle.com/models/MiDpAbMBO/"; // Ensure trailing slash or handle in code

// Emoji and color palette assigned dynamically per label
const PALETTE = [
  { color: "#22c55e", glow: "rgba(34,197,94,0.4)",  bg: "rgba(34,197,94,0.07)"  },
  { color: "#f43f5e", glow: "rgba(244,63,94,0.4)",  bg: "rgba(244,63,94,0.07)"  },
  { color: "#38bdf8", glow: "rgba(56,189,248,0.4)", bg: "rgba(56,189,248,0.07)" },
  { color: "#f59e0b", glow: "rgba(245,158,11,0.4)", bg: "rgba(245,158,11,0.07)" },
  { color: "#a78bfa", glow: "rgba(167,139,250,0.4)",bg: "rgba(167,139,250,0.07)"},
];

// Emojis used for the top-prediction display, ordered by label index
const AUTO_EMOJIS = ["😄", "😢", "😐", "😮", "😡", "🤩", "😴", "😎"];

// ─── State ───────────────────────────────────────────────────────────────────
let model       = null;
let labelKeys   = [];      // label names from model
let activeMode  = "upload"; // "upload" | "webcam"

// Webcam state
let webcamStream = null;
let rafId        = null;
let isRunning    = false;

// ─── DOM Refs ────────────────────────────────────────────────────────────────
const $statusIndicator = document.getElementById("statusIndicator");
const $statusText      = document.getElementById("statusText");
const $errorBanner     = document.getElementById("errorBanner");
const $errorText       = document.getElementById("errorText");
const $topPrediction   = document.getElementById("topPrediction");
const $predictionEmoji = document.getElementById("predictionEmoji");
const $predictionLabel = document.getElementById("predictionLabel");
const $predictionConf  = document.getElementById("predictionConfidence");
const $predWaiting     = document.getElementById("predictionWaiting");
const $confBars        = document.getElementById("confidenceBars");

// Upload mode
const $uploadCard    = document.getElementById("uploadCard");
const $dropZone      = document.getElementById("dropZone");
const $fileInput     = document.getElementById("fileInput");
const $previewWrap   = document.getElementById("previewWrap");
const $previewImg    = document.getElementById("previewImg");
const $classifyBtn   = document.getElementById("classifyBtn");
const $resetBtn      = document.getElementById("resetBtn");

// Webcam mode
const $webcamCard    = document.getElementById("webcamCard");
const $video         = document.getElementById("webcam");
const $canvas        = document.getElementById("canvas");
const $webcamOverlay = document.getElementById("webcamOverlay");
const $scanRing      = document.getElementById("scanRing");
const $webcamViewport= document.getElementById("webcamViewport");
const $startBtn      = document.getElementById("startBtn");
const $stopBtn       = document.getElementById("stopBtn");

// Tabs
const $tabUpload = document.getElementById("tabUpload");
const $tabWebcam = document.getElementById("tabWebcam");

// ─── Utility ─────────────────────────────────────────────────────────────────
function setStatus(state, text) {
  $statusIndicator.className = `status-indicator ${state}`;
  $statusText.textContent = text;
}
function showError(msg) { $errorText.textContent = msg; $errorBanner.style.display = "flex"; }
function hideError()    { $errorBanner.style.display = "none"; }

// ─── Model Loading ────────────────────────────────────────────────────────────
async function loadModel() {
  if (model) return true;
  setStatus("loading", "Loading model…");

  // Ensure MODEL_URL has a trailing slash for consistent concatenation
  const baseUrl = MODEL_URL.endsWith("/") ? MODEL_URL : MODEL_URL + "/";

  try {
    // Check if we are on file:// protocol, which often restricts fetches
    if (window.location.protocol === "file:") {
      console.warn("⚠️ Running from file:// protocol may cause CORS errors with Teachable Machine models.");
    }

    model = await tmImage.load(baseUrl + "model.json", baseUrl + "metadata.json");
    labelKeys = model.getClassLabels();
    console.log("✅ Model loaded. Labels:", labelKeys);
    buildConfidenceBars();
    setStatus("offline", "Ready");
    return true;
  } catch (err) {
    console.error("❌ Model load error:", err);
    
    let errorMsg = "Failed to load model.";
    if (window.location.protocol === "file:") {
      errorMsg += " (CORS error suspected). Please run this using a local server (like VS Code Live Server).";
    } else {
      errorMsg += " " + (err.message || "Check your internet connection.");
    }
    
    showError(errorMsg);
    setStatus("offline", "Error");
    return false;
  }
}

// ─── Dynamic Confidence Bars ──────────────────────────────────────────────────
function buildConfidenceBars() {
  $confBars.innerHTML = "";
  labelKeys.forEach((label, i) => {
    const palette = PALETTE[i % PALETTE.length];
    const id      = `bar-${i}`;
    const div = document.createElement("div");
    div.className = "confidence-item";
    div.id        = id;
    div.innerHTML = `
      <div class="confidence-label">
        <span class="conf-emoji">${AUTO_EMOJIS[i] || "🔘"}</span>
        <span class="conf-name">${label}</span>
        <span class="conf-value" id="val-${i}">0%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" id="fill-${i}" style="background:linear-gradient(90deg,${palette.color}99,${palette.color});box-shadow:0 0 12px ${palette.glow}"></div>
      </div>`;
    $confBars.appendChild(div);
  });
}

function updateUI(predictions) {
  if (!predictions || predictions.length === 0) return;

  const sorted  = [...predictions].sort((a, b) => b.probability - a.probability);
  const top     = sorted[0];
  const topIdx  = labelKeys.indexOf(top.className);
  const topConf = (top.probability * 100).toFixed(1);
  const palette = PALETTE[topIdx % PALETTE.length];

  // Top prediction card
  $predWaiting.style.display = "none";
  $predictionLabel.style.display = "block";
  $predictionConf.style.display  = "block";

  $predictionEmoji.textContent = AUTO_EMOJIS[topIdx] || "🤖";
  $predictionLabel.textContent = top.className;
  $predictionLabel.style.color = palette.color;
  $topPrediction.style.borderColor = palette.glow;
  $topPrediction.style.background  = palette.bg;
  $predictionConf.textContent = `${topConf}% confidence`;

  // Update confidence bars
  predictions.forEach((pred) => {
    const idx  = labelKeys.indexOf(pred.className);
    if (idx < 0) return;
    const pct  = (pred.probability * 100).toFixed(1);
    const isTop = pred.className === top.className;
    const $fill = document.getElementById(`fill-${idx}`);
    const $val  = document.getElementById(`val-${idx}`);
    const $item = document.getElementById(`bar-${idx}`);
    if ($fill) $fill.style.width = `${pct}%`;
    if ($val)  $val.textContent  = `${pct}%`;
    if ($item) $item.classList.toggle("active", isTop);
  });
}

function resetResults() {
  $predictionEmoji.textContent       = "🤖";
  $predWaiting.style.display         = "block";
  $predictionLabel.style.display     = "none";
  $predictionConf.style.display      = "none";
  $topPrediction.style.borderColor   = "";
  $topPrediction.style.background    = "";

  labelKeys.forEach((_, i) => {
    const $fill = document.getElementById(`fill-${i}`);
    const $val  = document.getElementById(`val-${i}`);
    const $item = document.getElementById(`bar-${i}`);
    if ($fill) $fill.style.width = "0%";
    if ($val)  $val.textContent  = "0%";
    if ($item) $item.classList.remove("active");
  });
}

// ─── Upload Mode ─────────────────────────────────────────────────────────────
function setupUploadMode() {
  // Drag and drop
  $dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    $dropZone.classList.add("drag-over");
  });
  $dropZone.addEventListener("dragleave", () => $dropZone.classList.remove("drag-over"));
  $dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    $dropZone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) showPreview(file);
  });

  // Click to browse
  $dropZone.addEventListener("click", () => $fileInput.click());
  $fileInput.addEventListener("change", () => {
    if ($fileInput.files[0]) showPreview($fileInput.files[0]);
  });

  // Classify button
  $classifyBtn.addEventListener("click", classifyUpload);

  // Reset
  $resetBtn.addEventListener("click", resetUpload);
}

function showPreview(file) {
  const url = URL.createObjectURL(file);
  $previewImg.src = url;
  $previewWrap.style.display = "block";
  $dropZone.style.display    = "none";
  $classifyBtn.disabled      = false;
  resetResults();
  hideError();
}

function resetUpload() {
  $previewWrap.style.display = "none";
  $dropZone.style.display    = "flex";
  $classifyBtn.disabled      = true;
  $fileInput.value           = "";
  resetResults();
}

async function classifyUpload() {
  hideError();
  const ok = await loadModel();
  if (!ok) return;

  $classifyBtn.innerHTML = `<span class="spinner"></span> Analyzing…`;
  $classifyBtn.disabled  = true;

  try {
    const predictions = await model.predict($previewImg);
    updateUI(predictions);
    setStatus("active", "Done!");
    setTimeout(() => setStatus("offline", "Ready"), 2000);
  } catch (err) {
    showError("Classification failed: " + err.message);
  } finally {
    $classifyBtn.innerHTML = `<span class="btn-icon">✨</span> Classify Image`;
    $classifyBtn.disabled  = false;
  }
}

// ─── Webcam Mode ─────────────────────────────────────────────────────────────
async function startClassifier() {
  hideError();
  const ok = await loadModel();
  if (!ok) return;

  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    $video.srcObject = webcamStream;
    await new Promise((r) => { $video.onloadedmetadata = r; });
    $video.style.display = "block";
    $canvas.width  = $video.videoWidth  || 640;
    $canvas.height = $video.videoHeight || 480;
  } catch (err) {
    const msg = err.name === "NotAllowedError" ? "🚫 Camera permission denied."
              : err.name === "NotFoundError"   ? "📷 No camera found."
              : `Camera error: ${err.message}`;
    showError(msg);
    return;
  }

  isRunning = true;
  $webcamOverlay.style.display = "none";
  $scanRing.classList.add("active");
  $webcamViewport.classList.add("active");
  setStatus("active", "Analyzing…");
  $startBtn.disabled = true;
  $stopBtn.disabled  = false;
  rafId = requestAnimationFrame(classifyFrame);
}

async function classifyFrame() {
  if (!isRunning || !model) return;
  const ctx = $canvas.getContext("2d");
  ctx.drawImage($video, 0, 0, $canvas.width, $canvas.height);
  try {
    const predictions = await model.predict($canvas);
    updateUI(predictions);
  } catch (err) {
    console.warn("Frame skip:", err);
  }
  rafId = requestAnimationFrame(classifyFrame);
}

function stopClassifier() {
  isRunning = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  if (webcamStream) { webcamStream.getTracks().forEach((t) => t.stop()); webcamStream = null; }
  $video.srcObject = null;
  $video.style.display = "none";
  $webcamOverlay.style.display = "flex";
  $webcamOverlay.querySelector(".overlay-text").textContent = "Camera stopped";
  $webcamOverlay.querySelector(".overlay-hint").textContent = 'Click "Start Camera" to begin again';
  $scanRing.classList.remove("active");
  $webcamViewport.classList.remove("active");
  setStatus("offline", "Ready");
  $startBtn.disabled = false;
  $stopBtn.disabled  = true;
  resetResults();
}

// ─── Tab Switching ────────────────────────────────────────────────────────────
function switchTab(mode) {
  activeMode = mode;
  if (mode === "upload") {
    $tabUpload.classList.add("active");
    $tabWebcam.classList.remove("active");
    $uploadCard.style.display = "block";
    $webcamCard.style.display = "none";
    if (isRunning) stopClassifier();
  } else {
    $tabWebcam.classList.add("active");
    $tabUpload.classList.remove("active");
    $webcamCard.style.display = "block";
    $uploadCard.style.display = "none";
    resetUpload();
  }
  resetResults();
  hideError();
}

// ─── Init ─────────────────────────────────────────────────────────────────────
setupUploadMode();
switchTab("upload"); // default mode

window.addEventListener("beforeunload", () => { if (isRunning) stopClassifier(); });

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  document.getElementById("tabWebcam").disabled = true;
  document.getElementById("tabWebcam").title    = "Webcam not supported in this browser";
}

console.log("🎭 AI Image Classifier ready. Upload an image or use webcam.");
