from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=50, blank=True)
    weight = models.CharField(max_length=50, blank=True)
    height = models.CharField(max_length=50, blank=True)
    blood_type = models.CharField(max_length=10, blank=True)
    allergies = models.TextField(blank=True)
    conditions = models.TextField(blank=True)
    medications = models.TextField(blank=True)
    email_notifications = models.BooleanField(default=True)
    health_tips = models.BooleanField(default=False)
    product_updates = models.BooleanField(default=True)

    def __str__(self):
        return f"Profile for {self.user.username}"

class LibraryTopic(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    icon_name = models.CharField(max_length=50, help_text="Lucide icon name")

    def __str__(self):
        return self.title

class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=255, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    message = models.TextField()
    reply = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.user.username}: {self.message[:50]}"

class HealthProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.IntegerField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True)
    conditions = models.TextField(blank=True)
    current_medicines = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Health Profile"

class BreathingSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pattern = models.CharField(max_length=50)
    rounds_completed = models.IntegerField()
    duration_seconds = models.IntegerField()
    done_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.pattern} - {self.done_at}"

class ChatSummary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    summary = models.TextField()
    full_chat = models.TextField()
    topic = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.topic} - {self.created_at}"
