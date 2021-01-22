
from django.urls import path

from . import views

app_name = "network"
urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name='post'),
    path("posts/<str:which_posts>/<int:page_number>", views.get_posts, name='get_posts'),
    path("view-posts/<str:which_posts>/", views.index, name="posts_view"),
    path("view-posts/<str:which_posts>/<int:page_number>", views.index, name="posts_view"),
    path("update-post/<str:post_id>", views.update_view, name="update"),
    path("get-username", views.get_username, name='get_username'),
    path("get-profile-info/<str:profile_name>", views.profile_view, name="profile"),
    path("like-post/<str:post_id>", views.likes_view, name="likes_view"),
    path("follow-profile/<str:profile_username>", views.follow_view, name="follow")
    

]
