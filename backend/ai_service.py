import torch 
import torch.nn as nn
from torchvision import models, transforms
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

model = models.resnet18()
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 4)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "kidney_model.pth")

def load_trained_model():
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
        model.eval()
        print("✅ PyTorch Kidney Model loaded successfully!")
    else:
        print(f"⚠️ Warning: {MODEL_PATH} not found in backend folder yet.")

load_trained_model()


CLASS_NAMES = ["Cyst", "Normal", "Stone", "Tumor"]

def predict_kidney_image(file_content, model):
    img = Image.open(io.BytesIO(file_content)).convert('RGB')
    
 
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    img_tensor = transform(img).unsqueeze(0)
    
    with torch.no_grad():
        outputs = model(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        confidence, index = torch.max(probabilities, 0)
    
    return {
        "result": CLASS_NAMES[index],
        "confidence": f"{confidence.item() * 100:.2f}%"
    }
# this is to check really and will only run if the file is run directly by name
if __name__ == "__main__":
  
    print(f"Model successfully loaded from: {MODEL_PATH}")
    print(f"Categories recognized: {CLASS_NAMES}")
    print("STATUS: READY FOR PREDICTIONS 🚀")