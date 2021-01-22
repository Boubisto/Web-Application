from django.forms import ModelForm, Textarea
from auctions.models import Listing, Bid


class ListingForm(ModelForm):
    class Meta:
        model = Listing
        fields = ['title', 'description', 'category', 'image_url', 'starting_bid']
        widgets = {
            'description': Textarea(attrs={'cols': 20, 'rows': 4}),
        }


class BidForm(ModelForm):
    class Meta:
        model = Bid
        fields = ['bid']