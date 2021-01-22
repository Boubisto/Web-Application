from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("recipes", views.add, name="add"),
    path("recipes/<int:recipe_id>", views.recipe, name="recipe"),
    path("recipes/<str:cookbook>", views.cookbook, name="cookbook"),
]