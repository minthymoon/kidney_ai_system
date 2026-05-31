import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import json

IMG_SIZE    = 528
CLASS_NAMES = ["Cyst", "Normal", "Stone", "Tumor"]
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))

CONFIG_PATH  = os.path.join(BASE_DIR, "config.json")
WEIGHTS_PATH = os.path.join(BASE_DIR, "model.weights.h5")

model = None

def load_trained_model():
    global model
    if os.path.exists(CONFIG_PATH) and os.path.exists(WEIGHTS_PATH):
        with open(CONFIG_PATH, "r") as f:
            config = json.load(f)
        model = tf.keras.models.model_from_json(json.dumps(config))

        model.load_weights(WEIGHTS_PATH)

        model_summary = f"Input: {model.input_shape}, Output: {model.output_shape}"
        print(f"✅ TensorFlow Kidney Model loaded successfully! ({model_summary})")
    else:
        if not os.path.exists(CONFIG_PATH):
            print(f"⚠️ Warning: config.json not found at {CONFIG_PATH}")
        if not os.path.exists(WEIGHTS_PATH):
            print(f"⚠️ Warning: model.weights.h5 not found at {WEIGHTS_PATH}")

load_trained_model()

def preprocess_image(file_content: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(file_content)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    return arr

def predict_kidney_image(file_content: bytes, _model=None):
    if model is None:
        raise RuntimeError("Model is not loaded. Check that config.json and model.weights.h5 exist in the backend folder.")

    img_tensor = preprocess_image(file_content)
    probs      = model.predict(img_tensor, verbose=0)[0]
    index      = int(np.argmax(probs))
    confidence = float(probs[index])

    return {
        "result":     CLASS_NAMES[index],
        "confidence": f"{confidence * 100:.2f}%"
    }

if __name__ == "__main__":
    print(f"Config path:  {CONFIG_PATH}")
    print(f"Weights path: {WEIGHTS_PATH}")
    print(f"Categories recognized: {CLASS_NAMES}")
    print("STATUS: READY FOR PREDICTIONS 🚀")