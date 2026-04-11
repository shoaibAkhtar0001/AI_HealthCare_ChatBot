from django.contrib import admin
from .models import ChatMessage, UserProfile, LibraryTopic

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'age', 'gender')
    search_fields = ('user__username', 'full_name')

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'timestamp')
    search_fields = ('user__username', 'message', 'reply')
    list_filter = ('timestamp',)

@admin.register(LibraryTopic)
class LibraryTopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'category')
    list_filter = ('category',)
    search_fields = ('title', 'description')
