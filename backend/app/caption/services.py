import numpy as np
import pickle
import os
import requests
from io import BytesIO
from tensorflow.keras.models import load_model #type:ignore
from tensorflow.keras.preprocessing.sequence import pad_sequences #type:ignore
from tensorflow.keras.preprocessing.image import load_img, img_to_array #type:ignore

caption_model = None
feature_extractor = None
tokenizer = None
MAX_LENGTH = 27
IMG_SIZE = 224


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODEL_DIR, "model.keras")
TOKENIZER_PATH = os.path.join(MODEL_DIR, "tokenizer.pkl")
FEATURE_EXTRACTOR_PATH = os.path.join(MODEL_DIR, "feature_extractor.keras")


def load_components():
    """Load caption model, feature extractor, and tokenizer (only once)."""
    global caption_model, feature_extractor, tokenizer

    if caption_model is None:
        if os.path.exists(MODEL_PATH):
            caption_model = load_model(MODEL_PATH)
            print("Caption model loaded.")
        else:
            print("Caption model file not found!")

    if feature_extractor is None:
        if os.path.exists(FEATURE_EXTRACTOR_PATH):
            feature_extractor = load_model(FEATURE_EXTRACTOR_PATH)
            print("Feature extractor loaded.")
        else:
            print("Feature extractor file not found!")


    if tokenizer is None:
        if os.path.exists(TOKENIZER_PATH):
            with open(TOKENIZER_PATH, "rb") as f:
                tokenizer = pickle.load(f)
            print("Tokenizer loaded.")
        else:
            print("Tokenizer file not found!")


def preprocess_image(image_path: str):
    """Load image from URL or path and preprocess for model."""
    if image_path.startswith("http"):
        response = requests.get(image_path)
        response.raise_for_status()
        img = load_img(BytesIO(response.content), target_size=(IMG_SIZE, IMG_SIZE))
    else:
        img = load_img(image_path, target_size=(IMG_SIZE, IMG_SIZE))

    img = img_to_array(img) / 255.0
    img = np.expand_dims(img, axis=0)
    return img

def clean_caption(caption: str) -> str:
    """Remove repeated words while preserving order."""
    words = caption.split()
    seen = set()
    clean_words = []
    for w in words:
        if w not in seen:
            clean_words.append(w)
            seen.add(w)
    return " ".join(clean_words)

def generate_caption(image_path: str, threshold:float = 0.3) -> tuple[str, float]:
    """Generate caption and confidence score for an image."""
    global caption_model, feature_extractor, tokenizer

    # Ensure models are loaded
    load_components()

    if not caption_model or not feature_extractor or not tokenizer:
        return "Model not loaded properly", 0.0

    # Extract features
    img = preprocess_image(image_path)
    image_features = feature_extractor.predict(img, verbose=0)

    # Generate sequence
    in_text = "startseq"
    confidences = []

    for _ in range(MAX_LENGTH):
        sequence = tokenizer.texts_to_sequences([in_text])[0]
        sequence = pad_sequences([sequence], maxlen=MAX_LENGTH)
        yhat = caption_model.predict([image_features, sequence], verbose=0)

        yhat_probs = yhat[0]
        yhat_index = np.argmax(yhat_probs)
        word = tokenizer.index_word.get(yhat_index, None)
        confidence = yhat_probs[yhat_index]
        confidences.append(confidence)

        if word is None:
            break
        in_text += " " + word
        if word == "endseq":
            break

    caption = in_text.replace("startseq", "").replace("endseq", "").strip()
    caption = clean_caption(caption)
    avg_conf = float(np.mean(confidences))

    if avg_conf < threshold:
        caption += f" (low confidence: {avg_conf:.2f})"
    return caption, avg_conf