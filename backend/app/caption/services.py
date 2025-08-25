import tensorflow as tf
import numpy as np
import pickle
from PIL import Image
import requests
from io import BytesIO
import os
import random
class CaptionGenerator:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.max_length = 27      
        self.vocab_size = 29914
        self.feature_extractor = None
        self.universal_captions = [
            "Just another chapter.",
            "Here, now, always.",
            "A vibe is a vibe.",
            "Some days speak for themselves.",
            "No filter needed.",
            "Part of the story.",
            "Silent but loud.",
            "Unfolding as it should.",
            "It is what it is.",
            "Lost in the moment.",
            "More than words.",
            "A feeling you can’t describe.",
            "Read between the lines.",
            "Here goes nothing.",
            "Not everything needs a caption.",
            "Echoes of today.",
            "Same place, different story.",
            "Untold but felt.",
            "A mood, not a sentence.",
            "Some things speak for themselves.",
            "Caught in the middle of everything.",
            "This says enough.",
            "Moments over moods."
        ]
        self.load_model()
    
    def load_model(self):
        """Load model, tokenizer, and features"""
        try:
            model_path = "models/model.h5"
            tokenizer_path = "models/tokenizer.pkl"

            if os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                print("Model loaded successfully")
            
            if os.path.exists(tokenizer_path):
                with open(tokenizer_path, 'rb') as f:
                    self.tokenizer = pickle.load(f)
                print("Tokenizer loaded successfully")
            
            base_model = tf.keras.applications.VGG16(weights="imagenet")
            self.feature_extractor = tf.keras.Model(
                inputs=base_model.input,
                outputs=base_model.layers[-2].output
            )

        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
            self.tokenizer = None
    
    def generate_caption(self, image_url: str) -> str:
        """Main function to generate caption"""
        try:
            if not self.model or not self.tokenizer:
                # fallback: random universal caption
                return random.choice(self.universal_captions)

            # Preprocess image
            image_array = self.preprocess_image(image_url)
            if image_array is None:
                return random.choice(self.universal_captions)
            
            # Extract features
            features = self.extract_features(image_array)
            if features is None:
                return random.choice(self.universal_captions)
            
            # Generate caption
            caption = self.greedy_search_caption(features)
            return caption

        except Exception as e:
            print(f"Error generating caption: {e}")
            # fallback
            return random.choice(self.universal_captions)
# Global instance
caption_generator = CaptionGenerator()