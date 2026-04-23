import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os


MODEL_PATH = os.path.join("ai", "model_traning_phase1.h5")


print("Loading AI model... please wait...")
model = tf.keras.models.load_model(MODEL_PATH)
print("AI model loaded successfully!")


CLASS_NAMES = ["Cyst", "Normal", "Stone", "Tumor"]

def predict_kidney_image(file_content):
    """
    Takes raw image data, cleans it, and asks the AI for a verdict.
    """
   
    img = Image.open(io.BytesIO(file_content)).convert('RGB')
    
    img = img.resize((224, 224))
    
    img_array = np.array(img) / 255.0
    
    img_array = np.expand_dims(img_array, axis=0)
    
    predictions = model.predict(img_array)
    
    index = np.argmax(predictions[0])
    confidence = np.max(predictions[0])
    
    return {
        "result": CLASS_NAMES[index],
        "confidence": f"{confidence * 100:.2f}%"
    }

# this is to check really and will only run if the file is run directly by name
if __name__ == "__main__":
  
    print(f"Model successfully loaded from: {MODEL_PATH}")
    print(f"Categories recognized: {CLASS_NAMES}")
    print("STATUS: READY FOR PREDICTIONS 🚀")