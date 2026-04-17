"""
Train nail-disease classifier. Safe to run from:
  - backend/:  python ml_model/train_model.py
  - ml_model/: python train_model.py

Outputs (under backend/ml_model/):
  - nail_disease_model.h5
  - class_indices.json
  - class_names_order.json
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import cast

import numpy as np
import tensorflow as tf
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# --- Paths: ml_model dir is always the file location (artifacts go here) ---
ML_MODEL_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ML_MODEL_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

BASE_DIR = ML_MODEL_DIR
MODEL_PATH = BASE_DIR / "nail_disease_model.h5"
CLASS_MAP_PATH = BASE_DIR / "class_indices.json"
CLASS_NAMES_ORDER_PATH = BASE_DIR / "class_names_order.json"

# Import preprocess: ensure backend/ is on path so "ml_model" is a package
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from ml_model.image_preprocessing import preprocess_rgb_image  # noqa: E402


def _debug_path(label: str, p: Path) -> None:
    exists = p.exists()
    kind = "dir" if p.is_dir() else ("file" if p.is_file() else "missing")
    print(f"[train] {label}: {p}  ({kind}, exists={exists})")


def _find_dataset_root() -> Path:
    """
    Resolve DTI-project/dataset (train + validation siblings).
    Tries: project root, backend/, ml_model/, then search under project root.
    """
    print("[train] DEBUG: resolving dataset (need .../train and .../validation)")
    _debug_path("ML_MODEL_DIR", ML_MODEL_DIR)
    _debug_path("BACKEND_DIR", BACKEND_DIR)
    _debug_path("PROJECT_ROOT", PROJECT_ROOT)

    candidates = [
        PROJECT_ROOT / "dataset",
        BACKEND_DIR / "dataset",
        ML_MODEL_DIR / "dataset",
        PROJECT_ROOT / "backend" / "dataset",
    ]

    for root in candidates:
        train_d = root / "train"
        val_d = root / "validation"
        print(f"[train]   candidate root: {root}")
        print(f"[train]     train:        {train_d.is_dir()}")
        print(f"[train]     validation:   {val_d.is_dir()}")
        if train_d.is_dir() and val_d.is_dir():
            print(f"[train] Using dataset root: {root.resolve()}")
            return root.resolve()

    # Search: any .../train with sibling validation under project root
    _skip_parts = frozenset(
        {"venv", ".venv", "node_modules", ".git", "__pycache__", "site-packages"}
    )
    print("[train] DEBUG: searching under PROJECT_ROOT for train/ + validation/ pairs...")
    for train_dir in PROJECT_ROOT.rglob("train"):
        if not train_dir.is_dir():
            continue
        if _skip_parts.intersection(train_dir.parts):
            continue
        parent = train_dir.parent
        if (parent / "validation").is_dir():
            try:
                train_dir.relative_to(PROJECT_ROOT)
            except ValueError:
                continue
            print(f"[train] Found dataset via search: {parent.resolve()}")
            return parent.resolve()

    tried = "\n  ".join(str(c) for c in candidates)
    raise FileNotFoundError(
        "Could not find dataset with non-empty 'train' and 'validation' folders.\n"
        f"  PROJECT_ROOT={PROJECT_ROOT}\n"
        f"  Tried:\n  {tried}\n"
        "Place data at: <project>/dataset/train and <project>/dataset/validation"
    )


DATASET_DIR = _find_dataset_root()
TRAIN_DIR = DATASET_DIR / "train"
VAL_DIR = DATASET_DIR / "validation"
TEST_DIR = DATASET_DIR / "test"

_debug_path("TRAIN_DIR (final)", TRAIN_DIR)
_debug_path("VAL_DIR (final)", VAL_DIR)
_debug_path("TEST_DIR", TEST_DIR)
print(f"[train] Artifacts (model + class JSON) -> {BASE_DIR.resolve()}")

# Reproducibility
SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)

IMG_SIZE = (224, 224)
BATCH_SIZE = 16
INITIAL_EPOCHS = 12
FINE_TUNE_EPOCHS = 10
if os.environ.get("TRAIN_QUICK", "").strip().lower() in ("1", "true", "yes"):
    INITIAL_EPOCHS = 1
    FINE_TUNE_EPOCHS = 1
    print("[train] TRAIN_QUICK=1: using 1+1 epochs for smoke test")

# Data generators
train_datagen = ImageDataGenerator(
    rotation_range=30,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.15,
    zoom_range=0.25,
    horizontal_flip=True,
    fill_mode="nearest",
    preprocessing_function=lambda img: preprocess_rgb_image(img, apply_augmentation=True),
)
eval_datagen = ImageDataGenerator(
    preprocessing_function=lambda img: preprocess_rgb_image(img, apply_augmentation=False)
)

train_data = train_datagen.flow_from_directory(
    str(TRAIN_DIR),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=True,
    seed=SEED,
)

val_data = eval_datagen.flow_from_directory(
    str(VAL_DIR),
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False,
)

test_data = None
if TEST_DIR.exists():
    test_data = eval_datagen.flow_from_directory(
        str(TEST_DIR),
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        shuffle=False,
    )
else:
    print("Warning: test directory not found. Test accuracy will be skipped.")


def _class_names_in_index_order(class_indices: dict, num_classes: int) -> list[str]:
    """Build [name@0, name@1, ...] from Keras class_indices without sorting class names."""
    out: list[str | None] = [None] * num_classes
    for name, idx in class_indices.items():
        i = int(idx)
        if i < 0 or i >= num_classes:
            raise ValueError(f"Invalid class index {i} for name {name!r}")
        if out[i] is not None:
            raise ValueError(f"Duplicate class index {i}: {out[i]!r} and {name!r}")
        out[i] = str(name)
    if any(x is None for x in out):
        missing = [i for i, x in enumerate(out) if x is None]
        raise ValueError(f"Missing class names for indices: {missing}")
    return cast(list[str], out)


# Save class mapping immediately (same generator as training)
_ci = train_data.class_indices
_nc = train_data.num_classes
try:
    _names_order = _class_names_in_index_order(_ci, _nc)
    with open(CLASS_MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(_ci, f, indent=2)
    with open(CLASS_NAMES_ORDER_PATH, "w", encoding="utf-8") as f:
        json.dump(_names_order, f, indent=2)
    print(
        f"[train] Saved {CLASS_MAP_PATH.name} and {CLASS_NAMES_ORDER_PATH.name} "
        f"({_nc} classes) -> {BASE_DIR.resolve()}"
    )
except Exception as e:
    print(f"Warning: could not write class mapping files: {e}")

# Handle class imbalance
classes_in_train = train_data.classes
class_weights_array = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(classes_in_train),
    y=classes_in_train,
)
class_weights = {i: float(w) for i, w in enumerate(class_weights_array)}

# Transfer learning model
base_model = tf.keras.applications.EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3),
)
base_model.trainable = False

model = models.Sequential(
    [
        layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3)),
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dropout(0.35),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.35),
        layers.Dense(train_data.num_classes, activation="softmax"),
    ]
)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

callbacks = [
    EarlyStopping(monitor="val_accuracy", patience=5, restore_best_weights=True),
    ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=2, min_lr=1e-6),
    ModelCheckpoint(str(MODEL_PATH), monitor="val_accuracy", save_best_only=True),
]

# Stage 1: train top layers
model.fit(
    train_data,
    validation_data=val_data,
    epochs=INITIAL_EPOCHS,
    callbacks=callbacks,
    class_weight=class_weights,
    verbose=1,
)

# Stage 2: fine-tune upper layers of EfficientNet
base_model.trainable = True
for layer in base_model.layers[:-40]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

model.fit(
    train_data,
    validation_data=val_data,
    epochs=INITIAL_EPOCHS + FINE_TUNE_EPOCHS,
    initial_epoch=INITIAL_EPOCHS,
    callbacks=callbacks,
    class_weight=class_weights,
    verbose=1,
)

# Load best weights and report metrics
best_model = tf.keras.models.load_model(str(MODEL_PATH))
val_loss, val_acc = best_model.evaluate(val_data, verbose=0)
print(f"Validation accuracy: {val_acc:.4f} | Validation loss: {val_loss:.4f}")

if test_data is not None:
    test_loss, test_acc = best_model.evaluate(test_data, verbose=0)
    print(f"Test accuracy: {test_acc:.4f} | Test loss: {test_loss:.4f}")

# Refresh class mapping from the same generator
_names_final = _class_names_in_index_order(train_data.class_indices, train_data.num_classes)
with open(CLASS_MAP_PATH, "w", encoding="utf-8") as f:
    json.dump(train_data.class_indices, f, indent=2)
with open(CLASS_NAMES_ORDER_PATH, "w", encoding="utf-8") as f:
    json.dump(_names_final, f, indent=2)

print(f"Model training complete. Saved best model to: {MODEL_PATH.resolve()}")
print(
    f"Deploy together: {MODEL_PATH.name}, {CLASS_MAP_PATH.name}, {CLASS_NAMES_ORDER_PATH.name}"
)
