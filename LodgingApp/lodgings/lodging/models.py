from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    avatar = CloudinaryField(null=True)
    dob = models.DateField(auto_now=False, auto_now_add=False, default="2000-10-10")
    phone_number = models.CharField(max_length=10, null=False, default="None")
    role = models.CharField(max_length=10, null=False, default="user")


class Owner(User):
    id_num = models.CharField(max_length=10, null=False, default="None")
    image = CloudinaryField(null=True)

    class Meta:
        verbose_name = "Owner"

    def __str__(self):
        return self.username


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class ImageOwner(BaseModel):
    image = CloudinaryField(null=True)
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name='image_owner')


class Lodging(BaseModel):
    title = models.CharField(max_length=255, default="New Lodging")
    locate = models.CharField(max_length=100, null=False)
    price = models.IntegerField(default=1)
    description = RichTextField(default=None)
    image = CloudinaryField(null=True)
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class ImageLodging(BaseModel):
    image = CloudinaryField(null=True)
    lodging = models.ForeignKey(Lodging, on_delete=models.CASCADE, related_name='image_lodging')


class SPrice(BaseModel):
    name = models.CharField(max_length=100, null=False, unique=True)
    value = models.IntegerField()

    lodging = models.ForeignKey(Lodging, on_delete=models.CASCADE, related_name='service_price')


class Post(BaseModel):
    title = models.CharField(max_length=255, default="New post")
    area = models.CharField(max_length=100, null=False) #
    price = models.IntegerField(default=1)
    content = RichTextField(default=None)

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Follow(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name='follower')
    followed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'owner')
        ordering = ['-followed_at']

    def __str__(self):
        return f"{self.user.username} follows {self.owner.user.username}"


class Comment(models.Model):
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Comment by {self.owner.user.username} on {self.post.title}'

    class Meta:
        ordering = ['-created_at']


class CommentUL(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments_lodging')
    lodging = models.ForeignKey(Lodging, on_delete=models.CASCADE, related_name='comments_lodging')
    content = models.TextField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Comment by {self.user.username} on {self.lodging.title}'

    class Meta:
        ordering = ['-created_at']
