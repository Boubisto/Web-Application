from django.urls import path

from . import views

app_name = "auctions"
urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("createListing", views.createListing, name="createListing"),
    path("listing/<int:listing_id>", views.listing, name="listing"),
    path("watchlist/<int:listing_id>", views.watchlist, name="watchlist"),
    path("createBid/<int:listing_id>", views.createBid, name="createBid"),
    path("closeListing/<int:listing_id>", views.closeListing, name="closeListing"),
    path("comment/<int:listing_id>", views.comment, name="comment"),
    path("categories/<str:category>", views.categoryIndex, name='categoryIndex'),
    path("watchlistPage", views.watchlistPage, name="watchlistPage"),
    path("categories", views.categories, name="categories")
]
