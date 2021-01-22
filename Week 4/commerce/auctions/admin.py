from django.contrib import admin

from .models import User, Listing, Bid, Comment

# Register your models here.

class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "description", "category", "author", "starting_bid")

class BidAdmin(admin.ModelAdmin):
    list_display = ("listing", "bid", "bidder")

class CommentAdmin(admin.ModelAdmin):
    list_display = ("author","comment_content", "listing")


admin.site.register(User)
admin.site.register(Listing, ListingAdmin)
admin.site.register(Bid, BidAdmin)
admin.site.register(Comment, CommentAdmin)
