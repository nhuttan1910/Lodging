from django.contrib import admin
from django.template.response import TemplateResponse

from .models import User, Lodging, Owner, Comment, CommentUL, Post, Follow, ImageLodging, ImageOwner, SPrice
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.urls import path


class ImageLodgingInline(admin.StackedInline):
    model = ImageLodging
    pk_name = 'lodging'


class ImageOwnerInline(admin.StackedInline):
    model = ImageOwner
    pk = 'owner'


class LodgingForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Lodging
        fields = '__all__'


class LodgingAdmin(admin.ModelAdmin):
    form = LodgingForm
    inlines = (ImageLodgingInline, )


class PostForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Post
        fields = '__all__'


class PostAdmin(admin.ModelAdmin):
    form = PostForm


# class OwnerAdmin(admin.ModelAdmin):
#     # inlines = (ImageOwnerInline, )
#     list_display = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'avatar', 'dob', 'phone_number',
#                     'role', 'image', 'cmt']
#
#
# class UserAdmin(admin.ModelAdmin):
#     list_display = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'avatar', 'dob', 'phone_number',
#                     'role']


class LodgingAppAdminSite(admin.AdminSite):
    site_header = 'Lodging App Manage'

    def get_urls(self):
        return [
            path('app-stats/', self.app_stats)
        ] + super().get_urls()

    def app_stats(self, request):
        lodging_count = Lodging.objects.count()

        return TemplateResponse(request, 'admin/app-stats.html', {
            'lodging_count' : lodging_count
        })


admin_site = LodgingAppAdminSite('lodgingappadmin')

# admin_site.register(Owner, OwnerAdmin)
admin_site.register(Lodging, LodgingAdmin)
admin_site.register(Post, PostAdmin)
# admin_site.register(User, UserAdmin)
