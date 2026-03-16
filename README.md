# 🎭 AI Face Classifier — Teachable Machine

> **Task 3 · Apexcify Technologies Internship**
> Classify live webcam images as **Happy Face**, **Sad Face**, or **Neutral** using Google's Teachable Machine model and TensorFlow.js — all in the browser, no installation required.

---

## 🚀 Quick Start

### Option A — Direct Open (Chrome/Edge)
```
Double-click index.html
```
> ⚠️ Some browsers block webcam access on `file://` URIs. If the camera doesn't start, use **Option B**.

### Option B — Local HTTP Server (Recommended)
```bash
npx -y serve .
```
Then open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
TASK 3 Image Classifier with Teachable Machine Model/
├── index.html          # Main page — webcam feed + results panel
├── style.css           # Premium dark-mode UI with animations
├── app.js              # Teachable Machine integration + inference loop
└── README.md           # This file
```

---

## 🧠 How It Works

```
Webcam Frame
     │
     ▼
Hidden <canvas>   ←  drawImage() every animation frame
     │
     ▼
tmImage.predict()  ←  Teachable Machine model (MobileNet backbone)
     │
     ▼
Probabilities:  Happy  |  Sad  |  Neutral
     │
     ▼
Update UI  ←  top label + animated confidence bars
```

### Key Concepts

| Concept | Explanation |
|---|---|
| **Model** | A mathematical function trained on image data to map inputs → predictions |
| **Image Classification** | Assigning a label (class) to an image based on its content |
| **Transfer Learning** | Re-using a powerful base model (MobileNet) trained on millions of images; only the final classifier layer is re-trained |
| **Confidence Score** | A probability between 0–1 indicating how certain the model is for each class |
| **Inference** | Running the model on new data (your webcam frame) to get predictions |

---

## 🛠️ Tech Stack

| Tool | Role |
|---|---|
| [Google Teachable Machine](https://teachablemachine.withgoogle.com/) | Model training & hosting |
| [TensorFlow.js](https://www.tensorflow.org/js) | In-browser ML inference engine |
| [@teachablemachine/image](https://www.npmjs.com/package/@teachablemachine/image) | High-level wrapper for TM image models |
| HTML5 / CSS3 / Vanilla JS | UI, webcam access, animations |

---

## 🎯 Classification Classes

| Emoji | Label | Description |
|---|---|---|
| 😄 | **Happy Face** | Smiling or joyful expression |
| 😢 | **Sad Face** | Frowning or sorrowful expression |
| 😐 | **Neutral** | Resting / neutral face |

---

## 📚 What You Learn

- ✅ What a machine learning **model** is and how it works
- ✅ How **image classification** pipelines are structured
- ✅ Using **pre-trained models** without training from scratch
- ✅ **Transfer learning**: leveraging MobileNet as a feature extractor
- ✅ Running ML inference entirely **in the browser** with TensorFlow.js
- ✅ Reading and displaying **confidence scores** for multiple classes
- ✅ Handling **webcam APIs** (`getUserMedia`) in JavaScript

---

## 🌐 Browser Requirements

- **Recommended**: Chrome 90+ or Edge 90+
- **Webcam**: Any standard USB or built-in camera
- **Internet**: Required on first load to fetch the TensorFlow.js and model files (cached afterwards)

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| Camera doesn't start | Use `npx -y serve .` and open via `http://localhost:3000` |
| Model fails to load | Check internet connection; the model is hosted on teachablemachine.withgoogle.com |
| Permission denied | Click the camera icon in your browser's address bar and allow access |
| Blank page | Make sure all 3 files (`index.html`, `style.css`, `app.js`) are in the same folder |

---

## 🎨 UI Features

- **Live webcam feed** with mirror effect and animated scan ring
- **Animated confidence bars** with smooth width transitions
- **Color-coded predictions** — green (Happy), red (Sad), blue (Neutral)
- **Premium dark-mode** glassmorphism design
- **Status indicator** showing camera + model state
- **Error banners** for graceful failure handling

---

*Built with ♥ using Google Teachable Machine & TensorFlow.js — made by Gotam Dulhani*
