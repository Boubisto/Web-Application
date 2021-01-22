import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Recipe

# Create your views here.

def index(request):

    # Authenticated users view their menu
    if request.user.is_authenticated:
        return render(request, "recipe/menu.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))


@csrf_exempt
@login_required
def add(request):

    # Adding a new recipe must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)

    # Get contents of recipe
    title = data.get("title", "")
    description = data.get("description", "")
    ingredients = data.get("ingredients", "")

    # Create one recipe for creator
    users = set()
    users.add(request.user)
    for user in users:
        recipe = Recipe(
            user=user,
            creator=request.user,
            title=title,
            description=description,
            ingredients=ingredients,
        )
        recipe.save()

    return JsonResponse({"message": "Recipe added successfully."}, status=201)


@login_required
def cookbook(request, cookbook):

    # Filter recipes returned based on cookbook
    if cookbook == "menu":
        recipes = Recipe.objects.filter(
            user=request.user, creator=request.user, saved=False
        )
    elif cookbook == "added":
        recipes = Recipe.objects.filter(
            user=request.user, creator=request.user
        )
    elif cookbook == "favorite":
        recipes = Recipe.objects.filter(
            user=request.user, creator=request.user, saved=True
        )
    else:
        return JsonResponse({"error": "Invalid cookbook."}, status=400)

    # Return recipes in reverse chronologial order
    recipes = recipes.order_by("-timestamp").all()
    return JsonResponse([recipe.serialize() for recipe in recipes], safe=False)


@csrf_exempt
@login_required
def recipe(request, recipe_id):

    # Query for requested recipe
    try:
        recipe = Recipe.objects.get(user=request.user, pk=recipe_id)
    except Recipe.DoesNotExist:
        return JsonResponse({"error": "Recipe not found."}, status=404)

    # Return recipe contents
    if request.method == "GET":
        return JsonResponse(recipe.serialize())

    # Update when recipe is saved to favorite
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("saved") is not None:
            recipe.saved = data["saved"]
        recipe.save()
        return HttpResponse(status=204)

    # Recipe must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "recipe/login.html", {
                "message": "Invalid email and/or password."
            })
    else:
        return render(request, "recipe/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "recipe/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(email, email, password)
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "recipe/register.html", {
                "message": "Email address already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "recipe/register.html")
