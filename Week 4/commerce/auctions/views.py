from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from .forms import ListingForm, BidForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from .models import User, Listing, Bid, Comment


def index(request):
    active_listings = Listing.objects.all().filter(closed=False)
    return render(request, "auctions/index.html", {
        'listings': active_listings
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
            return HttpResponseRedirect(reverse("auctions:index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("auctions:index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("auctions:index"))
    else:
        return render(request, "auctions/register.html")


@login_required
def createListing(request):
    if request.method == "POST":
        form = ListingForm(request.POST)
        try:
            new_listing = form.save(commit=False)
            assert request.user.is_authenticated
            new_listing.author = request.user
            new_listing.save()
            return HttpResponseRedirect(reverse("auctions:index"), {
                "message": "Your Listing has been saved"
            })

        except ValueError:
            pass

    else:
        form = ListingForm()
    return render(request, "auctions/createListing.html", {
        "form": form
    })

def listing(request, listing_id, bid_form=None):

    listing = Listing.objects.get(pk=listing_id)
    if request.user.is_authenticated:
        is_watch_list = request.user.watchlist_listing.filter(pk=listing_id).exists()
        if not bid_form:
            bid_form = BidForm()
        is_mine = listing.author == request.user
    else:
        is_watch_list = None
        bid_form = None
        is_mine = None

    return render(request, "auctions/listing.html", {
        'listing': listing,
        'is_watchlist': is_watch_list,
        'form': bid_form,
        'is_mine': is_mine,
        'title': "Listings"
    })

@login_required
def watchlist(request, listing_id):
    if request.method == "POST":
        assert request.user.is_authenticated
        user = request.user
        listing = Listing.objects.get(pk=listing_id)
        if user.watchlist_listing.filter(pk=listing_id).exists():
            user.watchlist_listing.remove(listing)
        else:
            user.watchlist_listing.add(listing)
    return HttpResponseRedirect(reverse("auctions:listing", args=(listing_id,)))

@login_required
def createBid(request, listing_id):
    if request.method == "POST":
        listing = Listing.objects.get(pk=listing_id)
        bid = Bid(bidder=request.user, listing=listing)
        bid_form = BidForm(request.POST, instance=bid)
        if bid_form.is_valid():
            bid_form.save()
        else:
            return listing(request, listing_id, bid_form=bid_form)

    return HttpResponseRedirect(reverse("auctions:listing", args=(listing_id,)))

@login_required
def closeListing(request, listing_id):
    if request.method == "POST":
        assert request.user.is_authenticated
        listing = Listing.objects.get(pk=listing_id)
        if request.user == listing.author:
            listing.closed = True
            listing.save()
    return HttpResponseRedirect(reverse("auctions:listing", args=(listing_id,)))

@login_required
def comment(request, listing_id):
    if request.method == "POST":
        assert request.user.is_authenticated
        listing = Listing.objects.get(pk=listing_id)
        comment_content = request.POST['comment']
        comment = Comment(author=request.user, listing=listing, comment_content=comment_content)
        comment.save()
    return HttpResponseRedirect(reverse("auctions:listing", args=(listing_id,)))

def categoryIndex(request, category):
    return render(request, "auctions/index.html", {
        'listings': Listing.objects.filter(closed=False, category=category),
        'title': f'Listings {category}"'
    })


@login_required
def watchlistPage(request):
    assert request.user.is_authenticated
    return render(request, "auctions/index.html", {
        'listings': request.user.watchlist_listing.all(),
        'title': "Watchlist"
    })


def categories(request):

    categories = list(set([listing.category for listing in Listing.objects.all() if listing.category]))
    return render(request, "auctions/categories.html", {
        'categories': categories
    })

