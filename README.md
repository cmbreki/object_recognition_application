# Object Recognition app

Real-time object detection using your device camera.
Built with **Python (Flask)** backend + **TensorFlow.js (COCO-SSD)** frontend AI.

Application available **[here](https://object-recognition-application.onrender.com/)**

---

## Features

 - Process camera feed live with AI object detection  
 - All processing runs locally in your browser (no server uploads)  
 - TensorFlow.js for browser-based inference  
 - Recognizes people, animals, vehicles, furniture, up to 90 objects.  

---

## How it works

1. **Backend (Flask)** - Serves the HTML page; no AI processing on server side
2. **Frontend (TensorFlow.js)** - Downloads pre-trained COCO-SSD model on first use
3. **Browser processing** - Your camera feed is analyzed locally in real-time
4. **Canvas visualization** - Detected objects drawn with bounding boxes and confidence scores

---

## Requirements

- Python 3.x
- Modern web browser with WebGL support (for GPU acceleration)
- Camera access permission

---

## Run locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the Flask server
python app.py

# 3. Open browser at
http://localhost:5000

# 4. Click START to enable camera and begin detection
```

---

## Project structure

```
object_recognition_app/
│
├── app.py                 ← Flask server (serves HTML)
├── requirements.txt       ← Python dependencies (Flask)
├── Procfile               ← Deployment config for Render
│
├── templates/
│   └── index.html         ← Single-page HTML with UI structure & info panel
│
└── static/
    ├── css/
    │   └── style.css      ← Styling elements
    └── js/
        └── script.js      ← Camera, video processing
```

## What can it detect?

The COCO-SSD model recognizes **90 object classes** including:
person, bicycle, car, motorbike, plane, bus, train, truck,
cat, dog, horse, chair, sofa, laptop, phone, book, bottle, and more.
