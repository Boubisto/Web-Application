from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    pass


class Recipe(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="recipes")
    creator = models.ForeignKey("User", on_delete=models.PROTECT, related_name="recipes_added")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    ingredients = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    saved = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "creator": self.creator.email,
            "title": self.title,
            "description": self.description,
            "ingredients": self.ingredients,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "saved": self.saved
        }
