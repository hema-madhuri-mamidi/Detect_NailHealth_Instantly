from django.urls import path

from .views import (
    auth_login_api,
    auth_logout_api,
    auth_me_api,
    auth_register_api,
    predict_api,
    predictions_list_api,
)

urlpatterns = [
    path('predict/', predict_api, name='predict'),
    path("auth/register/", auth_register_api, name="auth_register"),
    path("auth/login/", auth_login_api, name="auth_login"),
    path("auth/logout/", auth_logout_api, name="auth_logout"),
    path("auth/me/", auth_me_api, name="auth_me"),
    path("predictions/", predictions_list_api, name="predictions_list"),
]