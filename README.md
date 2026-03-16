# 🎭 AI Face Classifier — Teachable Machine

[![Contributors](https://img.shields.io/github/contributors/Gotam-Dulhani/Image-Classifier)](https://github.com/Gotam-Dulhani/Image-Classifier/graphs/contributors)
[![Forks](https://img.shields.io/github/forks/Gotam-Dulhani/Image-Classifier)](https://github.com/Gotam-Dulhani/Image-Classifier/network/members)
[![Stars](https://img.shields.io/github/stars/Gotam-Dulhani/Image-Classifier)](https://github.com/Gotam-Dulhani/Image-Classifier/stargazers)
[![Issues](https://img.shields.io/github/issues/Gotam-Dulhani/Image-Classifier)](https://github.com/Gotam-Dulhani/Image-Classifier/issues)
[![License](https://img.shields.io/github/license/Gotam-Dulhani/Image-Classifier)](https://github.com/Gotam-Dulhani/Image-Classifier/blob/main/LICENSE)

> Classify live webcam images as **😄 Happy**, **😢 Sad**, or **😐 Neutral** using Google's Teachable Machine model and TensorFlow.js — entirely in the browser, no installation required.

🌐 **[Explore the docs »](#)**
🚀 **[View Demo](#)** · 🐛 **[Report Bug](#)** · 🌟 **[Request Feature](#)**

---

## 📌 Table of Contents

* [About The Project](#-about-the-project)
* [Key Features](#-key-features)
* [Built With](#-built-with)
* [How It Works](#-how-it-works)
* [Classification Classes](#-classification-classes)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Troubleshooting](#-troubleshooting)
* [Contributing](#-contributing)
* [License](#-license)
* [Contact](#-contact)

---

## 💡 About The Project

The **AI Face Classifier** is a browser-based machine learning app that uses a **Google Teachable Machine** model (powered by a MobileNet backbone) to classify facial expressions in real-time from your webcam feed.

No Python. No backend. No installation. Everything runs entirely in the browser using **TensorFlow.js** — the model is loaded from Teachable Machine's hosting and inference happens locally on your device.

---

## ✨ Key Features

* **Real-Time Inference** – Classifies your webcam frame on every animation tick.
* **3-Class Prediction** – Happy, Sad, and Neutral with live confidence scores.
* **100% In-Browser** – TensorFlow.js runs ML inference with no server needed.
* **Transfer Learning** – MobileNet used as a pre-trained feature extractor.
* **Animated Confidence Bars** – Color-coded, smooth animated probability display.
* **Premium Dark UI** – Glassmorphism design with webcam mirror effect and scan ring.
* **Graceful Error Handling** – Status indicators and error banners for camera/model issues.

---

## 🛠 Built With

| Tool | Role |
|---|---|
| Google Teachable Machine | Model training & hosting |
| TensorFlow.js | In-browser ML inference engine |
| @teachablemachine/image | High-level wrapper for TM image models |
| HTML5 / CSS3 / Vanilla JS | UI, webcam access & animations |

---

## 🧠 How It Works

```
Webcam Frame
     │
     ▼
Hidden <canvas>  ←  drawImage() every animation frame
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
| **Image Classification** | Assigning a label to an image based on its visual content |
| **Transfer Learning** | Re-using MobileNet trained on millions of images; only the final classifier layer is re-trained |
| **Confidence Score** | A probability (0–1) showing how certain the model is for each class |
| **Inference** | Running the trained model on new data (webcam frame) to get live predictions |

---

## 🎯 Classification Classes

| Emoji | Label | Description |
|---|---|---|
| 😄 | **Happy Face** | Smiling or joyful expression |
| 😢 | **Sad Face** | Frowning or sorrowful expression |
| 😐 | **Neutral** | Resting or neutral face |

---

## 📁 Project Structure

```
Image-Classifier/
│
├── index.html      # Main page — webcam feed + results panel
├── style.css       # Premium dark-mode UI with animations
├── app.js          # Teachable Machine integration + inference loop
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Chrome 90+ or Edge 90+
* Any standard USB or built-in webcam
* Internet connection (required on first load to fetch TensorFlow.js and model files — cached afterwards)

### Option A — Direct Open *(Chrome/Edge)*

```bash
# Simply double-click index.html
```

> ⚠️ Some browsers block webcam access on `file://` URIs. If the camera doesn't start, use **Option B**.

### Option B — Local HTTP Server *(Recommended)*

```bash
npx -y serve .
```

Then open **http://localhost:3000** in your browser.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| Camera doesn't start | Use `npx -y serve .` and open via `http://localhost:3000` |
| Model fails to load | Check internet connection — model is hosted on teachablemachine.withgoogle.com |
| Permission denied | Click the camera icon in your browser's address bar and allow access |
| Blank page | Make sure all 3 files (`index.html`, `style.css`, `app.js`) are in the same folder |

---

## 📚 What You Learn

* What a machine learning **model** is and how it works
* How **image classification** pipelines are structured
* Using **pre-trained models** without training from scratch
* **Transfer learning** — leveraging MobileNet as a feature extractor
* Running ML inference entirely **in the browser** with TensorFlow.js
* Reading and displaying **confidence scores** for multiple classes
* Handling **webcam APIs** (`getUserMedia`) in JavaScript

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch:

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes:

```bash
git commit -m "Add AmazingFeature"
```

4. Push and open a Pull Request:

```bash
git push origin feature/AmazingFeature
```

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## 📫 Contact

**Gotam Dulhani**
GitHub: [https://github.com/Gotam-Dulhani](https://github.com/Gotam-Dulhani)

---

## 🙏 Acknowledgments

* [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
* [TensorFlow.js Documentation](https://www.tensorflow.org/js)
* [@teachablemachine/image](https://www.npmjs.com/package/@teachablemachine/image)
* Open Source Community ❤️
