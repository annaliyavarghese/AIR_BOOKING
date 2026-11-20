from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'approval_status', 'is_staff')
    list_filter = ('approval_status', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Approval Details', {'fields': ('approval_status',)}),
    )