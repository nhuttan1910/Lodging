from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import ModelSerializer
from .models import *


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'dob', 'phone_number',
                  'role']
        extra_kwargs = {
            'password': {'write_only': 'true'}
        }

    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(data["password"])

        user.save()

        return user


class ImageOwnerSerializer(ModelSerializer):
    class Meta:
        model = ImageOwner
        fields = ['id', 'image', 'owner']


class OwnerSerializer(ModelSerializer):
    # image_owner = ImageOwnerSerializer(many=True)

    class Meta:
        model = Owner
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'avatar', 'dob', 'phone_number',
                  'role', 'id_num', 'image']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        data = validated_data.copy()

        owner = Owner(**data)
        owner.set_password(data["password"])

        owner.save()

        return owner


class ImageLodgingSerializer(ModelSerializer):
    class Meta:
        model = ImageLodging
        fields = ['id', 'image', 'lodging']


# class SPriceSerializer(ModelSerializer):
#     class Meta:
#         model = SPrice
#         fields = ['name', 'value', 'lodging']


class LodgingSerializer(ModelSerializer):
    class Meta:
        model = Lodging
        fields = ['id', 'title', 'locate', 'price', 'description', 'image', 'owner']


class PostSerializer(ModelSerializer):

    class Meta:
        model = Post
        fields = ['id', 'area', 'price', 'content', 'user']


class FollowSerializer(ModelSerializer):
    class Meta:
        model = Follow
        fields = ['user', 'owner', 'followed_at']


class AuthenticatedOwnerDetailsSerializer(OwnerSerializer):
    followed = SerializerMethodField()

    def get_followed(self, owner):
        return owner.follow_set.filter(active=True).exists()

    class Meta:
        model = OwnerSerializer.Meta.model
        fields = OwnerSerializer.Meta.fields + ['followed']


class CommentSerializer(ModelSerializer):

    class Meta:
        model = Comment
        fields = ['id', 'post', 'content', 'created_at', 'owner']


class CommentULSerializer(ModelSerializer):
    user = UserSerializer

    class Meta:
        model = CommentUL
        fields = ['id', 'lodging', 'content', 'created_at', 'user']
