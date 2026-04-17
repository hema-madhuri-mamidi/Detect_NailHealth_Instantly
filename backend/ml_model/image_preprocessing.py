import cv2
import numpy as np


def _gray_world_white_balance(rgb_image: np.ndarray) -> np.ndarray:
    """Simple white-balance correction for varying camera lighting."""
    img = rgb_image.astype(np.float32)
    mean_rgb = img.reshape(-1, 3).mean(axis=0) + 1e-6
    gray = mean_rgb.mean()
    scale = gray / mean_rgb
    img = img * scale
    return np.clip(img, 0, 255).astype(np.uint8)


def preprocess_rgb_image(rgb_image: np.ndarray, apply_augmentation: bool = False) -> np.ndarray:
    """
    Robust preprocessing for mobile/real-time images.
    Input shape: (H, W, 3), RGB, uint8 or float.
    Output shape: (H, W, 3), RGB float32 in [0, 255].
    """
    if rgb_image is None:
        raise ValueError("Input image is None.")

    if rgb_image.dtype != np.uint8:
        rgb_image = np.clip(rgb_image, 0, 255).astype(np.uint8)

    # Normalize color cast from different camera/light sources
    balanced = _gray_world_white_balance(rgb_image)

    # Improve local contrast under low-light / shadow conditions
    lab = cv2.cvtColor(balanced, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

    # Mild denoise while preserving lesion boundaries
    enhanced = cv2.bilateralFilter(enhanced, d=5, sigmaColor=40, sigmaSpace=40)

    if apply_augmentation:
        if np.random.rand() < 0.5:
            # Small brightness jitter to simulate live camera shifts
            alpha = np.random.uniform(0.9, 1.1)
            beta = np.random.uniform(-8, 8)
            enhanced = cv2.convertScaleAbs(enhanced, alpha=alpha, beta=beta)

    return enhanced.astype(np.float32)
