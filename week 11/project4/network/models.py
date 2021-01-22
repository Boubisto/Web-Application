from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("self", related_name="following", blank=True, symmetrical=False)

    def number_of_followers(self):
        return len(self.followers.all())

    def number_of_following(self):
        return len(self.following.all())


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    users_likes = models.ManyToManyField(User, related_name="liked_posts", blank=True)


    def likes(self):
        return len(self.users_likes.all())

    def __str__(self):
        return f'Post by {self.author} saying "{self.content}".' \
               f' Has {self.likes()} like{"s" if self.likes() != 1 else ""}.'

    def serialize(self, logged_in_user=None):
        return {
            "id": self.id,
            "author": self.author.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes(),
            "liked": logged_in_user in self.users_likes.all() if logged_in_user else False
        }
