import torch 
import torch.nn as nn
from torchvision import models, transforms
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os


IMG_SIZE    = 528
CLASS_NAMES = ["Cyst", "Normal", "Stone", "Tumor"]

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model_traning_phase1.h5")

model = None

def load_trained_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        model_summary = f"Input: {model.input_shape}, Output: {model.output_shape}"
        print(f"✅ TensorFlow Kidney Model loaded successfully! ({model_summary})")
    else:
        print(f"⚠️ Warning: {MODEL_PATH} not found in backend folder yet.")

load_trained_model()

def preprocess_image(file_content: bytes) -> np.ndarray:
    """
    Accepts raw image bytes.
    Returns a batched float32 array of shape (1, 528, 528, 3).
    NOTE: Do NOT normalize to [0,1] — EfficientNetB6 handles
    its own normalization internally. Pass raw [0, 255] values.
    """
    img = Image.open(io.BytesIO(file_content)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    return arr

def predict_kidney_image(file_content: bytes, _model=None):
    """
    Drop-in replacement for the old predict_kidney_image().
    _model param kept for signature compatibility but ignored
    (model is loaded globally above).
    """
    if model is None:
        raise RuntimeError("Model is not loaded. Check that model_traning_phase1.h5 exists.")

    img_tensor = preprocess_image(file_content)

    probs = model.predict(img_tensor, verbose=0)[0]
    index = int(np.argmax(probs))
    confidence = float(probs[index])

    return {
        "result":      CLASS_NAMES[index],
        "confidence":  f"{confidence * 100:.2f}%"
    }

if __name__ == "__main__":
    print(f"Model successfully loaded from: {MODEL_PATH}")
    print(f"Categories recognized: {CLASS_NAMES}")
    print("STATUS: READY FOR PREDICTIONS 🚀")