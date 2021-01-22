from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Listing(models.Model):
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=64)
    image_url = models.CharField(max_length=64, blank=True)
    category = models.CharField(max_length=64)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author_listing")
    watchlist_user = models.ManyToManyField(User, blank=True, related_name="watchlist_listing")
    closed = models.BooleanField(default=False)
    starting_bid = models.DecimalField(max_digits=6, decimal_places=2)
    create_date = models.DateTimeField(auto_now=True)

    def current_bid(self):
        return max([bid.bid for bid in self.bids.all()]+[self.starting_bid])

    def number_of_bids(self):
        return len(self.bids.all())

    def winning_bidder(self):
        return self.bids.get(bid=self.current_bid()).user if self.number_of_bids() > 0 else None

    def __str__(self):
        return f"Listing: {self.title} by {self.author} at {self.create_date} Description: {self.description}" 


class Bid(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bids")
    bid = models.DecimalField(max_digits=6, decimal_places=2)
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_bids")

    def __str__(self):
        return f"{self.bidder} bids {self.bid} on {self.listing}"


class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_comments")
    comment_content = models.CharField(max_length=255)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="my_comments")

    def __str__(self):
        return f"{self.author} wrote {self.comment_content} for listing {self.listing}"

