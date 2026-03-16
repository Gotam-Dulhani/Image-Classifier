/**
 * AI Face Classifier — Teachable Machine Integration
 * Classifies live webcam frames as Happy Face, Sad Face, or Neutral
 * using Google's Teachable Machine image model + TensorFlow.js
 */

// ─── Configuration ─────────────────────────────────────────────────────────

// Teachable Machine: Face Expression demo model (publicly hosted)
// This is Google's official demo face-expression model
const MODEL_URL      = "https://teachablemachine.withgoogle.com/models/bXy2kDNi/";

// Label → UI mapping
const LABEL_MAP = {
  "Happy":   { key: "happy",   emoji: "😄", cssClass: "happy"   },
  "Sad":     { key: "sad",     emoji: "😢", cssClass: "sad"     },
  "Neutral": { key: "neutral", emoji: "😐", cssClass: "neutral" },
};

// Fallback display names if model uses different casing
const LABEL_ALIASES = {
  "happy face": "Happy",
  "sad face":   "Sad",
  "neutral":    "Neutral",
  "happy":      "Happy",
  "sad":        "Sad",
};

// ─── State ──────────────────────────────────────────────────────────────────

let model         = null;
let webcamStream  = null;
let rafId         = null;        // requestAnimationFrame ID
let isRunning     = false;
let labelKeys     = [];          // labels as returned by the model

// ─── DOM Refs ───────────────────────────────────────────────────────────────

const $video            = document.getElementById("webcam");
const $canvas           = document.getElementById("canvas");
const $overlay          = document.getElementById("webcamOverlay");
const $scanRing         = document.getElementById("scanRing");
const $webcamViewport   = document.getElementById("webcamViewport");
const $startBtn         = document.getElementById("startBtn");
const $stopBtn          = document.getElementById("stopBtn");
const $statusIndicator  = document.getElementById("statusIndicator");
const $statusText       = document.getElementById("statusText");
const $statusDot        = document.getElementById("statusDot");
const $errorBanner      = document.getElementById("errorBanner");
const $errorText        = document.getElementById("errorText");
const $topPrediction    = document.getElementById("topPrediction");
const $predictionEmoji  = document.getElementById("predictionEmoji");
const $predictionLabel  = document.getElementById("predictionLabel");
const $predictionConf   = document.getElementById("predictionConfidence");
const $predictionWaiting = $topPrediction.querySelector(".prediction-waiting");

// ─── Utility Helpers ────────────────────────────────────────────────────────

/**
 * Normalises a raw model label to a canonical key (Happy / Sad / Neutral).
 * Falls back to the raw label if not found in the alias map.
 */
function normaliseLabel(raw) {
  return LABEL_ALIASES[raw.toLowerCase().trim()] || raw;
}

/**
 * Sets the status pill text + CSS state class.
 * @param {"offline"|"loading"|"active"} state
 * @param {string} text
 */
function setStatus(state, text) {
  $statusIndicator.className = `status-indicator ${state}`;
  $statusText.textContent = text;
}

/** Show an error message in the red banner. */
function showError(msg) {
  $errorText.textContent = msg;
  $errorBanner.style.display = "flex";
}
function hideError() {
  $errorBanner.style.display = "none";
}

// ─── Model Loading ───────────────────────────────────────────────────────────

/**
 * Loads the Teachable Machine model from the CDN URL.
 * Uses the `tmImage` global injected by @teachablemachine/image CDN script.
 */
async function loadModel() {
  setStatus("loading", "Loading…");
  $startBtn.innerHTML = `<span class="spinner"></span> Loading…`;
  $startBtn.disabled = true;

  try {
    const modelURL    = MODEL_URL + "model.json";
    const metaURL     = MODEL_URL + "metadata.json";
    model = await tmImage.load(modelURL, metaURL);
    labelKeys = model.getClassLabels();
    console.log("✅ Model loaded. Labels:", labelKeys);
    return true;
  } catch (err) {
    console.error("❌ Model load error:", err);
    showError("Failed to load model. Check your internet connection and try again.");
    setStatus("offline", "Offline");
    resetStartButton();
    return false;
  }
}

// ─── Webcam ──────────────────────────────────────────────────────────────────

/** Requests webcam access and starts the video stream. */
async function startWebcam() {
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    $video.srcObject = webcamStream;
    await new Promise((resolve) => { $video.onloadedmetadata = resolve; });
    $video.style.display = "block";
    $canvas.width  = $video.videoWidth  || 640;
    $canvas.height = $video.videoHeight || 480;
    return true;
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      showError("🚫 Camera permission denied. Please allow camera access and try again.");
    } else if (err.name === "NotFoundError") {
      showError("📷 No camera found. Please connect a webcam and try again.");
    } else {
      showError(`Camera error: ${err.message}`);
    }
    return false;
  }
}

/** Stops the webcam stream and releases the device. */
function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach((t) => t.stop());
    webcamStream = null;
  }
  $video.srcObject = null;
  $video.style.display = "none";
}

// ─── Classification Loop ──────────────────────────────────────────────────────

/** Captures a frame from the video element and runs model prediction. */
async function classifyFrame() {
  if (!isRunning || !model) return;

  const ctx = $canvas.getContext("2d");
  ctx.drawImage($video, 0, 0, $canvas.width, $canvas.height);

  try {
    const predictions = await model.predict($canvas);
    updateUI(predictions);
  } catch (err) {
    console.warn("Prediction error (skipping frame):", err);
  }

  rafId = requestAnimationFrame(classifyFrame);
}

/**
 * Updates all UI elements with fresh prediction data.
 * @param {Array<{className: string, probability: number}>} predictions
 */
function updateUI(predictions) {
  if (!predictions || predictions.length === 0) return;

  // Sort by probability to find the top prediction
  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  const top    = sorted[0];
  const topLabel = normaliseLabel(top.className);
  const topConf  = (top.probability * 100).toFixed(1);
  const mapped   = LABEL_MAP[topLabel];

  // Top prediction box
  $predictionWaiting.style.display = "none";
  $predictionLabel.style.display   = "block";
  $predictionConf.style.display    = "block";

  if (mapped) {
    $predictionEmoji.textContent = mapped.emoji;
    $predictionLabel.textContent = topLabel === "Happy" ? "Happy Face 😄"
                                 : topLabel === "Sad"   ? "Sad Face 😢"
                                 :                        "Neutral 😐";
    $predictionLabel.className = `prediction-label ${mapped.cssClass}`;
    $topPrediction.className   = `top-prediction ${mapped.cssClass}`;
  } else {
    $predictionEmoji.textContent = "🤖";
    $predictionLabel.textContent = topLabel;
    $predictionLabel.className   = "prediction-label";
    $topPrediction.className     = "top-prediction";
  }
  $predictionConf.textContent = `${topConf}% confidence`;

  // Update each confidence bar
  predictions.forEach((pred) => {
    const label  = normaliseLabel(pred.className);
    const info   = LABEL_MAP[label];
    if (!info) return;

    const pct   = (pred.probability * 100).toFixed(1);
    const isTop = label === topLabel;

    const $fill = document.getElementById(`fill-${info.key}`);
    const $val  = document.getElementById(`val-${info.key}`);
    const $item = document.getElementById(`bar-${info.key}`);

    if ($fill) $fill.style.width = `${pct}%`;
    if ($val)  $val.textContent  = `${pct}%`;
    if ($item) {
      $item.classList.toggle("active", isTop);
    }
  });
}

// ─── Public Controls ─────────────────────────────────────────────────────────

/** Called by the "Start Camera" button. Loads model + webcam then starts classifying. */
async function startClassifier() {
  hideError();

  // Load model only once
  if (!model) {
    const ok = await loadModel();
    if (!ok) return;
  }

  // Start webcam
  const camOk = await startWebcam();
  if (!camOk) {
    resetStartButton();
    return;
  }

  // Activate UI
  isRunning = true;
  $overlay.style.display = "none";
  $scanRing.classList.add("active");
  $webcamViewport.classList.add("active");
  setStatus("active", "Analyzing…");

  $startBtn.disabled = true;
  $startBtn.innerHTML = `<span class="btn-icon">▶</span> Start Camera`;
  $stopBtn.disabled = false;

  // Begin classification loop
  rafId = requestAnimationFrame(classifyFrame);
}

/** Called by the "Stop" button. Halts the classification loop and releases camera. */
function stopClassifier() {
  isRunning = false;

  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

  stopWebcam();

  // Reset viewport
  $overlay.style.display = "flex";
  $overlay.querySelector(".overlay-text").textContent  = "Camera stopped";
  $overlay.querySelector(".overlay-hint").textContent  = "Click "Start Camera" to begin again";
  $scanRing.classList.remove("active");
  $webcamViewport.classList.remove("active");
  setStatus("offline", "Offline");

  // Reset prediction box
  $predictionEmoji.textContent        = "🤖";
  $predictionWaiting.style.display    = "block";
  $predictionLabel.style.display      = "none";
  $predictionConf.style.display       = "none";
  $topPrediction.className            = "top-prediction";

  // Reset bars to 0
  ["happy", "sad", "neutral"].forEach((key) => {
    const $fill = document.getElementById(`fill-${key}`);
    const $val  = document.getElementById(`val-${key}`);
    const $item = document.getElementById(`bar-${key}`);
    if ($fill) $fill.style.width = "0%";
    if ($val)  $val.textContent  = "0%";
    if ($item) $item.classList.remove("active");
  });

  $startBtn.disabled = false;
  $stopBtn.disabled  = true;
}

/** Resets the start button to its initial state (used on error). */
function resetStartButton() {
  $startBtn.innerHTML = `<span class="btn-icon">▶</span> Start Camera`;
  $startBtn.disabled  = false;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

// Safety: release webcam when user closes/refreshes the tab
window.addEventListener("beforeunload", () => {
  if (isRunning) stopClassifier();
});

// Detect missing getUserMedia support (very old browsers / no HTTPS)
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  showError(
    "Your browser does not support webcam access. " +
    "Please use Chrome or Edge. If you opened this as a file://, " +
    "serve it with: npx serve ."
  );
  $startBtn.disabled = true;
}

console.log("🎭 AI Face Classifier ready. Click 'Start Camera' to begin.");
