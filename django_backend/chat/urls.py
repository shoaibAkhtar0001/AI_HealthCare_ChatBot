from django.urls import path
from . import views

urlpatterns = [
    path('health', views.health, name='health'),
    path('signup', views.signup, name='signup'),
    path('login', views.login_view, name='login'),
    path('chat', views.chat, name='chat'),
    path('history', views.get_history, name='history'),
    path('sessions', views.get_sessions, name='sessions'),
    path('sessions/create', views.create_session, name='create_session'),
    path('sessions/delete', views.delete_session, name='delete_session'),
    path('profile', views.profile_view, name='profile'),
    path('library', views.library_view, name='library'),
    path('settings', views.settings_view, name='settings'),
    path('nearby-doctors', views.nearby_doctors, name='nearby_doctors'),
    path('health-profile', views.health_profile, name='health_profile'),
    path('health-history', views.health_history, name='health_history'),
    path('summarize-chat', views.summarize_chat, name='summarize_chat'),
    path('save-breathing', views.save_breathing, name='save_breathing'),
]
