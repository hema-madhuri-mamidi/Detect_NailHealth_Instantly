# import numpy as np
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing import image

# model = load_model("ml_model/nail_disease_model.h5")

# def predict_image(img_file):
#     img = image.load_img(img_file, target_size=(224, 224))
#     img_array = image.img_to_array(img)
#     img_array = np.expand_dims(img_array, axis=0)
#     img_array = img_array / 255.0

#     prediction = model.predict(img_array)

#     return str(prediction)
import numpy as np
import cv2
from tensorflow.keras.models import load_model
from pathlib import Path

# Lazy-load model so Django management commands work
_model = None


def _get_model():
    global _model
    if _model is not None:
        return _model

    model_path = Path(__file__).resolve().parent / "nail_disease_model.h5"
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model file not found at '{model_path}'. "
            "Place your .h5 file there or update the path in ml_model/predict.py."
        )

    _model = load_model(str(model_path))
    return _model

# Class labels in the same order as your model's output
classes = [
    "Acral_lentiginous_Melanoma",
    "Healthy_nail",
    "onychgrphosis",
    "blue_finger",
    "clubbing",
    "pitting",
]

def predict_image(image_or_bytes):
    """
    Accepts either raw bytes or a file-like object (e.g. Django UploadedFile).
    """
    if hasattr(image_or_bytes, "read"):
        image_bytes = image_or_bytes.read()
    else:
        image_bytes = image_or_bytes

    if not isinstance(image_bytes, (bytes, bytearray, memoryview)):
        raise TypeError(
            "A bytes-like object is required, not "
            f"{type(image_or_bytes).__name__!r}"
        )

    file_bytes = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image. Please upload a valid JPG/PNG.")

    # Preprocess
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (224, 224))
    image = image / 255.0
    image = np.reshape(image, (1, 224, 224, 3))

    # Prediction
    model = _get_model()
    prediction = model.predict(image)

    idx = int(np.argmax(prediction))
    predicted_class = classes[idx] if idx < len(classes) else str(idx)
    confidence = float(np.max(prediction))

    return {
        "prediction": predicted_class,
        "confidence": confidence
    }