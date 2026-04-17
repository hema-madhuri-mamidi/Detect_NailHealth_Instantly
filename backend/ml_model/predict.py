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
import json
import logging
from pathlib import Path

import cv2
import numpy as np
from tensorflow.keras.models import load_model

from ml_model.image_preprocessing import preprocess_rgb_image

logger = logging.getLogger(__name__)

# Lazy-load model so Django management commands work
_model = None


def _ordered_names_from_class_indices_dict(class_indices: dict, n_out: int) -> list[str] | None:
    """
    Build [name_for_index_0, name_for_index_1, ...] exactly as during training.

    Keras stores class_indices as {folder_name: index}. Index order is the only order that
    matters — do not sort class names alphabetically as a separate step.
    """
    try:
        idx_to_name = {int(idx): str(name) for name, idx in class_indices.items()}
    except (TypeError, ValueError):
        return None
    if len(idx_to_name) != n_out:
        return None
    if set(idx_to_name.keys()) != set(range(n_out)):
        return None
    return [idx_to_name[i] for i in range(n_out)]


def _class_names_from_order_json(n_out: int) -> list[str] | None:
    """Preferred: explicit list saved by train_model.py — index i == softmax index i."""
    path = Path(__file__).resolve().parent / "class_names_order.json"
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        logger.warning("class_names_order.json must be a JSON array of class names")
        return None
    if len(data) != n_out:
        logger.warning(
            "class_names_order.json has %s entries but model expects %s",
            len(data),
            n_out,
        )
        return None
    return [str(x) for x in data]


def _class_names_from_training_json(n_out: int) -> list[str] | None:
    """If class_indices.json exists and matches n_out, map training indices to names."""
    path = Path(__file__).resolve().parent / "class_indices.json"
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        logger.warning("class_indices.json must be a JSON object mapping class name -> index")
        return None
    names = _ordered_names_from_class_indices_dict(data, n_out)
    if names is None:
        logger.warning(
            "class_indices.json does not match model output size %s "
            "(need exactly %s contiguous indices 0..%s)",
            n_out,
            n_out,
            n_out - 1,
        )
    return names


def _class_names_from_dataset_train(n_out: int) -> list[str] | None:
    """
    Fallback when class_indices.json is missing: Keras flow_from_directory assigns indices
    by lexicographic order of subdirectory names (same as sorted(folder_names)).
    """
    train_dir = Path(__file__).resolve().parent / "dataset" / "train"
    if not train_dir.exists():
        return None
    names = sorted(p.name for p in train_dir.iterdir() if p.is_dir())
    if len(names) != n_out:
        logger.warning(
            "dataset/train has %s classes but model expects %s; skipping folder-based mapping",
            len(names),
            n_out,
        )
        return None
    return list(names)


# Last-resort fixed list — lexicographic order of these folder names (matches typical flow_from_directory)
_LEGACY_CLASS_NAMES = (
    "Acral_lentiginous_Melanoma",
    "Healthy_nail",
    "blue_finger",
    "clubbing",
    "onychgrphosis",
    "pitting",
)


def _resolve_class_names(n_out: int) -> list[str]:
    """
    Map argmax index -> class name. Priority:
    1) class_names_order.json (written by train_model.py — deploy with .h5)
    2) class_indices.json (strict index -> name)
    3) dataset/train subfolders in Keras default order (lexicographic)
    4) legacy 6-class tuple only if n_out matches

    n_out comes from the prediction tensor last dimension (not model.output).
    """
    from_order = _class_names_from_order_json(n_out)
    if from_order is not None:
        return from_order

    from_json = _class_names_from_training_json(n_out)
    if from_json is not None:
        return from_json

    from_folders = _class_names_from_dataset_train(n_out)
    if from_folders is not None:
        return from_folders

    if n_out == len(_LEGACY_CLASS_NAMES):
        logger.warning(
            "Using legacy class-name list; copy class_indices.json from training for correct mapping"
        )
        return list(_LEGACY_CLASS_NAMES)

    return [f"class_index_{i}" for i in range(n_out)]


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


def _model_has_nested_rescaling(model, depth=0, max_depth=32):
    """
    True if any layer (including inside EfficientNet / nested Sequential) is Rescaling.
    Training used float images in [0, 255]; EfficientNet applies Rescaling(1/255) inside.
    If we miss this and divide at the top level too, inputs become ~1/255 and predictions are wrong.
    """
    if depth > max_depth or model is None:
        return False
    for layer in getattr(model, "layers", []) or []:
        if layer.__class__.__name__ == "Rescaling":
            return True
        inner = getattr(layer, "layers", None)
        if inner and _model_has_nested_rescaling(layer, depth + 1, max_depth):
            return True
    return False


DISEASE_INFO = {
    "healthy_nail": {
        "reason": "No visible abnormality detected. Nail shape, color, and texture appear normal.",
        "deficiency": "No specific deficiency indicated.",
        "diet": "Maintain a balanced diet rich in proteins, vitamins (especially Biotin, Vitamin E), fruits, vegetables, and adequate hydration.",
    },
    "clubbing": {
        "reason": "Bulbous enlargement of fingertips which may be associated with chronic low oxygen levels in the blood.",
        "deficiency": "Not directly due to a nutrient deficiency, but may be linked to underlying lung, heart, or liver conditions.",
        "diet": "Include iron-rich foods (spinach, legumes), antioxidants, and maintain a nutritious diet. Medical evaluation is recommended.",
    },
    "onycholysis": {
        "reason": "Separation of the nail from the nail bed, often caused by trauma, fungal infection, or excessive moisture exposure.",
        "deficiency": "May sometimes be associated with iron deficiency or thyroid imbalance.",
        "diet": "Consume iron-rich foods (leafy greens, dates, beans), zinc-rich foods (nuts, seeds), and maintain good nail hygiene.",
    },
    "onychogryphosis": {
        "reason": "Thickened, curved, and overgrown nails, often due to poor nail care, aging, or repeated trauma.",
        "deficiency": "Generally not linked to a specific deficiency, but may be worsened by poor nutrition or circulation issues.",
        "diet": "Maintain a balanced diet with proteins, vitamins, and minerals. Ensure proper foot and nail care.",
    },
    "pitting": {
        "reason": "Small depressions on the nail surface, commonly associated with conditions like psoriasis or autoimmune disorders.",
        "deficiency": "Not usually due to nutritional deficiency, but may be linked to underlying skin or immune-related conditions.",
        "diet": "Include anti-inflammatory foods (fruits, vegetables, omega-3 rich foods like flaxseeds, walnuts). Consult a doctor if persistent.",
    },
    "acral_lentiginous_melanoma": {
        "reason": "A rare type of skin cancer that appears under nails or on palms/soles, often seen as dark pigmentation or streaks.",
        "deficiency": "Not related to nutritional deficiency; it is a serious medical condition involving abnormal cell growth.",
        "diet": "No specific diet treatment. Immediate medical consultation is strongly recommended for diagnosis and treatment.",
    },
    "bluefinger": {
        "reason": "Bluish discoloration of fingers due to reduced oxygen supply or poor blood circulation (cyanosis).",
        "deficiency": "May be associated with oxygen deficiency or circulatory issues rather than nutritional deficiency.",
        "diet": "Consume iron-rich foods, maintain warmth, stay hydrated, and improve circulation with a healthy lifestyle. Seek medical advice if frequent.",
    },
}

# Short reason strings keyed like training labels; kept for backward compatibility with
# code or stale bytecode that still references DISEASE_REASONS / _get_reason_for_label.
DISEASE_REASONS = {name: entry["reason"] for name, entry in DISEASE_INFO.items()}
DISEASE_REASONS["blue_finger"] = DISEASE_INFO["bluefinger"]["reason"]
DISEASE_REASONS["onychgrphosis"] = DISEASE_INFO["onychogryphosis"]["reason"]


def _get_reason_for_label(label: str) -> str:
    key = (label or "").lower().strip().replace(" ", "_")
    if "healthy" in key or "normal" in key:
        return DISEASE_REASONS["healthy_nail"]
    if key in ("blue_finger", "bluefinger"):
        return DISEASE_REASONS["bluefinger"]
    if key in ("onychogryphosis", "onychgrphosis"):
        return DISEASE_REASONS["onychogryphosis"]
    return DISEASE_REASONS.get(
        key,
        "Possible nail abnormality detected. Consider consulting a dermatologist for confirmation.",
    )


def _disease_info_key_for_label(label: str) -> str:
    """Map model class strings (any casing) to a DISEASE_INFO key."""
    key = (label or "").lower().strip().replace(" ", "_")
    if "healthy" in key or "normal" in key:
        return "healthy_nail"
    if key in ("blue_finger", "bluefinger"):
        return "bluefinger"
    if key in ("onychogryphosis", "onychgrphosis"):
        return "onychogryphosis"
    if "acral" in key and "melanoma" in key:
        return "acral_lentiginous_melanoma"
    return key


def disease_explanation_for_label(prediction_label: str) -> dict[str, str]:
    """Reason, deficiency, and diet strings for a stored prediction label (API / history)."""
    entry = DISEASE_INFO.get(_disease_info_key_for_label(prediction_label), {})
    return {
        "reason": entry.get("reason", ""),
        "deficiency": entry.get("deficiency", ""),
        "diet": entry.get("diet", ""),
    }


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

    # Decode + base preprocess
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (224, 224))
    image = preprocess_rgb_image(image, apply_augmentation=False)

    # Prediction (match training: preprocess_rgb_image -> float [0,255] for EfficientNet)
    model = _get_model()
    batch = np.expand_dims(image, axis=0).astype(np.float32)
    if not _model_has_nested_rescaling(model):
        # Older CNN trained with ImageDataGenerator(rescale=1/255) expects [0,1].
        batch = batch / 255.0
    prediction = model.predict(batch, verbose=0)
    n_out = int(prediction.shape[-1])
    classes = _resolve_class_names(n_out)

    probs = np.asarray(prediction[0], dtype=np.float64)
    idx = int(np.argmax(probs))
    # Highest softmax probability for the predicted class (same index as argmax)
    max_prob = float(probs[idx]) if 0 <= idx < probs.size else 0.0
    confidence_pct = round(max_prob * 100.0, 2)

    # Exact class name for training index idx (from class_indices.json when present)
    raw_label = classes[idx] if 0 <= idx < len(classes) else f"class_index_{idx}"
    logger.info(
        "predict_image: argmax_idx=%s n_out=%s mapped_label=%r confidence_pct=%s full_class_mapping=%s",
        idx,
        n_out,
        raw_label,
        confidence_pct,
        classes,
    )

    predicted_class = raw_label
    result = DISEASE_INFO.get(_disease_info_key_for_label(predicted_class), {})
    confidence = confidence_pct

    return {
        "prediction": predicted_class,
        "confidence": confidence,
        "reason": result.get("reason", ""),
        "deficiency": result.get("deficiency", ""),
        "diet": result.get("diet", ""),
    }