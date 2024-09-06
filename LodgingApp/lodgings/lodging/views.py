from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets, permissions, generics, status
from .models import *
from .serializers import *
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .paginator import *
from django.shortcuts import get_object_or_404
from .perms import *

def index(request):
    return HttpResponse("app find lodging")


def test(request, x):
    return HttpResponse("Hello" + str(x))


class UserViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.CreateAPIView,
                  generics.RetrieveAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()

        return Response(UserSerializer(user).data)


class OwnerCreateViewSet(viewsets.ModelViewSet,
                         generics.ListAPIView,
                         generics.CreateAPIView,
                         generics.RetrieveAPIView,
                         generics.DestroyAPIView):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    parser_classes = [MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['get_current_owner']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-owner', detail=False)
    def get_current_owner(self, request):
        try:
            owner = Owner.objects.get(id=request.user.id)
        except Owner.DoesNotExist:
            return Response({"detail": "Not an owner."}, status=400)

        if request.method == 'PATCH':
            for k, v in request.data.items():
                setattr(owner, k, v)
            owner.save()

        return Response(OwnerSerializer(owner).data)

    @action(methods=['post'], url_path='follow', detail=True)
    def follow(self, request, pk):
        follow, created = Follow.objects.get_or_create(owner=self.get_object(),
                                                       user=request.user)
        if not created:
            follow.active = not follow.active
            follow.save()

        return Response(AuthenticatedOwnerDetailsSerializer(self.get_object()).data)


class LodgingViewSet(viewsets.ModelViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView,
                     generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Lodging.objects.filter(active=True)
    serializer_class = LodgingSerializer
    # permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, ]
    # pagination_class = LodgingPaginator

    # def get_permissions(self):
    #     if self.action == 'list':
    #         return [permissions.AllowAny()]
    #     return [permissions.IsAuthenticated()]

    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='comment_ul', detail=True)
    def get_comment_ul(self, request, pk):
        comment_ul = self.get_object().comment_set.select_related('user').order_by('-id')

        paginator = CommentPaginator()
        page = paginator.paginate_queryset(comment_ul, request)
        if page is not None:
            serializer = CommentULSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(CommentULSerializer(comment_ul, many=True).data)

    @action(methods=['post'], url_path='comment_ul', detail=True)
    def add_comment_ul(self, request, pk):
        c_ul = self.get_object().comment_set.create(content=request.data.get('content'),
                                                    user=request.user)
        return Response(CommentULSerializer(c_ul).data, status=status.HTTP_201_CREATED)


class ImageOwnerViewSet(viewsets.ModelViewSet, generics.CreateAPIView,
                        generics.RetrieveAPIView, generics.ListAPIView, generics.DestroyAPIView,
                        generics.UpdateAPIView):
    queryset = ImageOwner.objects.all()
    serializer_class = ImageOwnerSerializer

    def get_permissions(self):
        if self.action in ['get_current_owner']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]


class ImageLodgingViewSet(viewsets.ModelViewSet, generics.CreateAPIView,
                          generics.RetrieveAPIView, generics.ListAPIView, generics.DestroyAPIView,
                          generics.UpdateAPIView):
    queryset = ImageLodging.objects.all()
    serializer_class = ImageLodgingSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class PostViewSet(viewsets.ModelViewSet, generics.ListAPIView, generics.CreateAPIView, generics.RetrieveAPIView,
                  generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    parser_classes = [MultiPartParser, ]

    # def get_permissions(self):
    #     if self.action in ['get_user_id', 'get_comment', 'add_comment']:
    #         return [permissions.IsAuthenticated()]
    #     return [permissions.AllowAny()]

    # @action(methods=['get'], url_path='get_user_id', detail=True)
    # def get_user_id(self, request, pk=None):
    #     user = request.user
    #     return Response({'user_id': user.id})

    @action(methods=['get'], url_path='comment', detail=True)
    def get_comment(self, request, pk=None):
        comment = self.get_object().comment_set.select_related('owner').order_by('-id')

        paginator = CommentPaginator()
        page = paginator.paginate_queryset(comment, request)
        if page is not None:
            serializer = CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(CommentSerializer(comment, many=True).data)

    @action(methods=['post'], url_path='comment', detail=True)
    def add_comment(self, request, pk=None):
        c = self.get_object().comment_set.create(content=request.data.get('content'),
                                                 owner=request.owner)
        return Response(CommentSerializer(c).data, status=status.HTTP_201_CREATED)


class FollowViewSet(viewsets.ModelViewSet, generics.CreateAPIView, generics.ListAPIView,generics.RetrieveAPIView):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Follow.objects.filter(user=self.request.user)
        return Follow.objects.none()

    # def get_permissions(self):
    #     if self.action == 'list':
    #         return [permissions.AllowAny()]
    #     return [permissions.IsAuthenticated()]

    @action(methods=['get'], url_path='follower', detail=True)
    def follower(self, request, pk=None):
        follower = Follow.objects.filter(user_id = pk)
        serializer = FollowSerializer(follower, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='following', detail=True)
    def following(self, request, pk=None):
        following = Follow.objects.filter(owner_id=pk)
        serializer = FollowSerializer(following, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='follow', detail=True)
    def follow(self, request, pk=None):
        user = self.get_object()
        owner = self.get_object()
        follow, created = Follow.objects.get_or_create(user=user, owner=owner)
        if created:
            return Response({'status': 'followed'}, status=status.HTTP_201_CREATED)
        follow.delete()
        return Response({'status': 'unfollowed'}, status=status.HTTP_204_NO_CONTENT)


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView,
                     generics.CreateAPIView, generics.RetrieveAPIView, generics.ListAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    # permission_classes = [OwnerCommentPermission]

    @action(methods=['get'], url_path='comment_post', detail=True)
    def get_comment(self, request, pk):
        g_comment = Comment.objects.filter(post_id=pk)
        serializer = CommentSerializer(g_comment, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='comment', detail=True)
    def cr_comment(self, request, pk):
        owner = Owner.get_objects.all()
        post = Post.get_objects.all()

        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=owner, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentULViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView,
                       generics.CreateAPIView, generics.RetrieveAPIView, generics.ListAPIView):
    queryset = CommentUL.objects.all()
    serializer_class = CommentULSerializer
    # permission_classes = [UserCommentPermission]

    @action(methods=['get'], url_path='comment_lodging', detail=True)
    def get_comment(self, request, pk):
        g_comment_ul = CommentUL.objects.filter(lodging_id = pk)
        serializer = CommentULSerializer(g_comment_ul, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='comment_ul', detail=True)
    def cr_comment(self, request, pk):
        user = User.get_objects.all()
        lodging = Lodging.get_objects.all()

        serializer = CommentULSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user, lodging=lodging)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
