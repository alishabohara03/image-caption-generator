# import tensorflow as tf
# import numpy as np
# import pickle
# from PIL import Image
# import requests
# from io import BytesIO
# import os
# import random
# # class CaptionGenerator:
# #     def __init__(self):
# #         self.model = None
# #         self.tokenizer = None
# #         self.max_length = 27      
# #         self.vocab_size = 29914
# #         self.feature_extractor = None
# #         self.universal_captions = [
# #             "Just another chapter.",
# #             "Here, now, always.",
# #             "A vibe is a vibe.",
# #             "Some days speak for themselves.",
# #             "No filter needed.",
# #             "Part of the story.",
# #             "Silent but loud.",
# #             "Unfolding as it should.",
# #             "It is what it is.",
# #             "Lost in the moment.",
# #             "More than words.",
# #             "A feeling you can’t describe.",
# #             "Read between the lines.",
# #             "Here goes nothing.",
# #             "Not everything needs a caption.",
# #             "Echoes of today.",
# #             "Same place, different story.",
# #             "Untold but felt.",
# #             "A mood, not a sentence.",
# #             "Some things speak for themselves.",
# #             "Caught in the middle of everything.",
# #             "This says enough.",
# #             "Moments over moods."
# #         ]
# #         self.load_model()
    
# #     def load_model(self):
# #         """Load model, tokenizer, and features"""
# #         try:
# #             model_path = "models/model.h5"
# #             tokenizer_path = "models/tokenizer.pkl"

# #             if os.path.exists(model_path):
# #                 self.model = tf.keras.models.load_model(model_path)
# #                 print("Model loaded successfully")
            
# #             if os.path.exists(tokenizer_path):
# #                 with open(tokenizer_path, 'rb') as f:
# #                     self.tokenizer = pickle.load(f)
# #                 print("Tokenizer loaded successfully")
            
# #             base_model = tf.keras.applications.VGG16(weights="imagenet")
# #             self.feature_extractor = tf.keras.Model(
# #                 inputs=base_model.input,
# #                 outputs=base_model.layers[-2].output
# #             )

# #         except Exception as e:
# #             print(f"Error loading model: {e}")
# #             self.model = None
# #             self.tokenizer = None
    
# #     def generate_caption(self, image_url: str) -> str:
# #         """Main function to generate caption"""
# #         try:
# #             if not self.model or not self.tokenizer:
# #                 # fallback: random universal caption
# #                 return random.choice(self.universal_captions)

# #             # Preprocess image
# #             image_array = self.preprocess_image(image_url)
# #             if image_array is None:
# #                 return random.choice(self.universal_captions)
            
# #             # Extract features
# #             features = self.extract_features(image_array)
# #             if features is None:
# #                 return random.choice(self.universal_captions)
            
# #             # Generate caption
# #             caption = self.greedy_search_caption(features)
# #             return caption

# #         except Exception as e:
# #             print(f"Error generating caption: {e}")
# #             # fallback
# #             return random.choice(self.universal_captions)
# # # Global instance
# # caption_generator = CaptionGenerator()

import numpy as np
import pickle
import os
import requests
from io import BytesIO
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.image import load_img, img_to_array

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

def generate_caption(image_path: str) -> str:
    """Generate caption with greedy search."""
    global caption_model, feature_extractor, tokenizer

    # Ensure models are loaded
    load_components()

    if not caption_model or not feature_extractor or not tokenizer:
        return "Model not loaded properly"

    # Extract features
    img = preprocess_image(image_path)
    image_features = feature_extractor.predict(img, verbose=0)

    # Generate sequence
    in_text = "startseq"

    for _ in range(MAX_LENGTH):
        sequence = tokenizer.texts_to_sequences([in_text])[0]
        sequence = pad_sequences([sequence], maxlen=MAX_LENGTH)
        yhat = caption_model.predict([image_features, sequence], verbose=0)
        yhat_index = np.argmax(yhat)
        word = tokenizer.index_word.get(yhat_index, None)
        if word is None:
            break
        in_text += " " + word
        if word == "endseq":
            break

    caption = in_text.replace("startseq", "").replace("endseq", "").strip()
    caption = clean_caption(caption)
    return caption