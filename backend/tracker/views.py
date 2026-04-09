from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ml_model.predict import predict_image

from .models import Prediction

User = get_user_model()


def _user_payload(user):
    return {
        "id": user.id,
        "username": user.get_username(),
        "email": getattr(user, "email", "") or "",
        "name": (user.get_full_name() or user.get_username()),
    }


@api_view(["POST"])
def auth_register_api(request):
    username = (request.data.get("username") or "").strip()
    email = (request.data.get("email") or "").strip()
    password = request.data.get("password") or ""
    name = (request.data.get("name") or "").strip()

    # Allow frontend to only send email + password (+ optional name)
    if not username:
        username = email

    if not username or not password:
        return Response({"error": "username/email and password are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    if name:
        parts = name.split(" ", 1)
        user.first_name = parts[0]
        if len(parts) > 1:
            user.last_name = parts[1]
        user.save(update_fields=["first_name", "last_name"])

    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": _user_payload(user)}, status=201)


@api_view(["POST"])
def auth_login_api(request):
    username_or_email = (request.data.get("username") or request.data.get("email") or "").strip()
    password = request.data.get("password") or ""

    if not username_or_email or not password:
        return Response({"error": "username/email and password are required"}, status=400)

    user = authenticate(request, username=username_or_email, password=password)
    if user is None:
        # If they used email but username differs, try resolving by email
        try:
            u = User.objects.get(email=username_or_email)
        except User.DoesNotExist:
            u = None
        if u is not None:
            user = authenticate(request, username=u.get_username(), password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=400)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "user": _user_payload(user)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def auth_logout_api(request):
    Token.objects.filter(user=request.user).delete()
    return Response({"success": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def auth_me_api(request):
    return Response({"user": _user_payload(request.user)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def predict_api(request):
    try:
        img = request.FILES.get("image")
        if not img:
            return Response({"error": "No image provided"}, status=400)

        image_bytes = img.read()
        img.seek(0)
        result = predict_image(image_bytes)

        pred = Prediction.objects.create(
            user=request.user,
            image=img,
            prediction=str(result.get("prediction", "")),
            confidence=float(result.get("confidence", 0.0)),
        )

        image_url = pred.image.url if pred.image else None
        return Response(
            {
                "id": pred.id,
                "prediction": pred.prediction,
                "confidence": pred.confidence,
                "created_at": pred.created_at.isoformat(),
                "image_url": image_url,
            }
        )
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def predictions_list_api(request):
    qs = Prediction.objects.filter(user=request.user).order_by("-created_at")[:50]
    data = [
        {
            "id": p.id,
            "prediction": p.prediction,
            "confidence": p.confidence,
            "created_at": p.created_at.isoformat(),
            "image_url": (p.image.url if p.image else None),
        }
        for p in qs
    ]
    return Response({"results": data})

# @api_view(['POST'])
# def predict_view(request):
#     img = request.FILES.get('image')

#     if not img:
#         return Response({"error": "No image provided"})

#     result = predict_image(img)

#     return Response({"prediction": result})