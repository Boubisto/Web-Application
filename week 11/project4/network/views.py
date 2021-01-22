from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core import serializers
from django.core.paginator import Paginator, EmptyPage
import json
from .models import User, Post


def index(request, which_posts="all", page_number=1):
    return render(request, "network/index.html", {
        "posts": serializers.serialize('json', Post.objects.all()),
        "which_posts": which_posts,
        "page_number": page_number
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("network:index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("network:index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("network:index"))
    else:
        return render(request, "network/register.html")

def post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required."}, status=400)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Please be logged in to post"}, status=400)
    Post(author=request.user, content=request.POST['content']).save()
    return JsonResponse({"success": "message posted successfully!"})

def get_posts(request, which_posts, page_number=1):
    if which_posts == "all":
        posts = Post.objects
    elif which_posts == "following":
        if request.user.is_authenticated:
            posts = Post.objects.filter(author__in=request.user.following.all())
        else:
            return JsonResponse({"error": "You are not logged in :("}, status=400)
    else:
        posts = Post.objects.filter(author__username=which_posts)

    ordered_posts = posts.order_by("-timestamp").all()
    paginator = Paginator(ordered_posts, 10)
    number_of_pages = paginator.num_pages
    try:
        page_requested = paginator.page(page_number)
    except EmptyPage:
        page_requested = paginator.page(1)

    posts_in_page = page_requested.object_list

    logged_in_user = request.user if request.user.is_authenticated else None
    return JsonResponse({
        "posts": [each_post.serialize(logged_in_user=logged_in_user) for each_post in posts_in_page],
        "upper_page_limit": number_of_pages
    }, safe=False)


def get_username(request):
    # Gives the client the logged in user 
    return JsonResponse({"username": request.user.username})

def profile_view(request, profile_name):
    user = User.objects.get(username=profile_name)
    return JsonResponse({"username": user.username, "follower_no": user.number_of_followers(),
                         "following_no": user.number_of_following(),
                         "following": user.followers.filter(
                             pk=request.user.pk).exists() if request.user.is_authenticated else None})


def likes_view(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Please be logged in to be able to post"}, status=400)
    data = json.loads(request.body)
    if 'liked' not in data:
        return JsonResponse({"error": "Please like it first or not"}, status=400)
    liked = json.loads(request.body)['liked']
    post_to_like = Post.objects.get(id=post_id)

    if liked:
        request.user.liked_posts.add(post_to_like)
    else:
        request.user.liked_posts.remove(post_to_like)

    return HttpResponse(status=204)


def follow_view(request, profile_username):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Please be logged in to follow or unfollow"}, status=400)
    data = json.loads(request.body)
    if 'following' not in data:
        return JsonResponse({"error": "Please follow it first or nah"}, status=400)
    following = json.loads(request.body)['following']
    profile_to_follow = User.objects.get(username=profile_username)

    if following:
        request.user.following.add(profile_to_follow)
    else:
        request.user.following.remove(profile_to_follow)

    return HttpResponse(status=204)


def update_view(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Please be logged in to be able to post"}, status=400)
    data = json.loads(request.body)
    if 'content' not in data:
        return JsonResponse({"error": "Please specify the new message"}, status=400)
    new_message = json.loads(request.body)['content']
    post_to_update = Post.objects.get(id=post_id)
    if post_to_update.author.pk != request.user.pk:
        return JsonResponse({"error": "Only author of post can modify their own post!"}, status=400)

    post_to_update.content = new_message
    post_to_update.save()

    return HttpResponse(status=204)



