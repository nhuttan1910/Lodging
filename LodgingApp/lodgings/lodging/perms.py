from rest_framework import permissions


class UserCommentPermission(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, comment_ul):
        is_authenticated = super().has_permission(request, view)
        is_owner = request.user == comment_ul.user
        return is_authenticated and is_owner


class OwnerCommentPermission(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, comment):
        is_authenticated = super().has_permission(request, view)
        is_owner = request.user == comment.owner
        return is_authenticated and is_owner
