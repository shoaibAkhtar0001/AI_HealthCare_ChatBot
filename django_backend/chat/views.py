import json
import base64
import time
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from .models import ChatMessage, UserProfile, LibraryTopic, ChatSession, HealthProfile, BreathingSession, ChatSummary
from google import genai
import os
from dotenv import load_dotenv
import requests

load_dotenv()

# Configure Gemini with the provided API key
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", ""))

@require_http_methods(["GET"])
def health(request):
    return JsonResponse({"status": "ok"})

@csrf_exempt
@require_http_methods(["POST"])
def signup(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        
        if not username or not password:
            return JsonResponse({"error": "Username and password required"}, status=400)
            
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)
            
        user = User.objects.create_user(username=username, email=email, password=password)
        # Create an empty profile for the new user
        UserProfile.objects.create(user=user, full_name=data.get("full_name", ""))
        return JsonResponse({"success": "User created", "user_id": user.id})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"success": "Logged in", "user_id": user.id, "username": user.username})
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def profile_view(request):
    user_id = request.GET.get("user_id") if request.method == "GET" else json.loads(request.body).get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id required"}, status=400)
    
    try:
        user = User.objects.get(id=user_id)
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        if request.method == "POST":
            data = json.loads(request.body)
            profile.full_name = data.get("full_name", profile.full_name)
            profile.age = data.get("age", profile.age)
            profile.gender = data.get("gender", profile.gender)
            profile.weight = data.get("weight", profile.weight)
            profile.height = data.get("height", profile.height)
            profile.blood_type = data.get("blood_type", profile.blood_type)
            profile.allergies = data.get("allergies", profile.allergies)
            profile.conditions = data.get("conditions", profile.conditions)
            profile.medications = data.get("medications", profile.medications)
            profile.save()
            return JsonResponse({"success": "Profile updated"})
        
        return JsonResponse({
            "full_name": profile.full_name,
            "age": profile.age,
            "gender": profile.gender,
            "weight": profile.weight,
            "height": profile.height,
            "blood_type": profile.blood_type,
            "allergies": profile.allergies,
            "conditions": profile.conditions,
            "medications": profile.medications,
            "email_notifications": profile.email_notifications,
            "health_tips": profile.health_tips,
            "product_updates": profile.product_updates,
        })
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@require_http_methods(["GET"])
def library_view(request):
    topics = LibraryTopic.objects.all()
    # Add some default topics if empty
    if not topics.exists():
        LibraryTopic.objects.create(title="Diabetes", description="Learn about managing blood sugar...", category="Chronic", icon_name="Activity")
        LibraryTopic.objects.create(title="Hypertension", description="Understand high blood pressure...", category="Chronic", icon_name="Heart")
        topics = LibraryTopic.objects.all()
        
    data = []
    for t in topics:
        data.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "category": t.category,
            "icon_name": t.icon_name
        })
    return JsonResponse({"topics": data})

@csrf_exempt
@require_http_methods(["GET", "POST"])
def settings_view(request):
    user_id = request.GET.get("user_id") if request.method == "GET" else json.loads(request.body).get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id required"}, status=400)
        
    try:
        user = User.objects.get(id=user_id)
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        if request.method == "POST":
            data = json.loads(request.body)
            if "notifications" in data:
                notifs = data["notifications"]
                profile.email_notifications = notifs.get("email", profile.email_notifications)
                profile.health_tips = notifs.get("tips", profile.health_tips)
                profile.product_updates = notifs.get("updates", profile.product_updates)
                profile.save()
            
            if "password" in data and data["password"]:
                user.set_password(data["password"])
                user.save()
            
            if "email" in data:
                user.email = data["email"]
                user.save()
                
            return JsonResponse({"success": "Settings updated"})

        return JsonResponse({
            "username": user.username,
            "email": user.email,
            "notifications": {
                "email": profile.email_notifications,
                "tips": profile.health_tips,
                "updates": profile.product_updates
            }
        })
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def chat(request):
    try:
        # Handle both JSON (text only) and FormData (with images)
        if request.content_type.startswith('multipart/form-data'):
            message = (request.POST.get("message") or "").strip()
            user_id = request.POST.get("user_id")
            session_id = request.POST.get("session_id")
            image_file = request.FILES.get("image")
        else:
            data = json.loads(request.body)
            message = (data.get("message") or "").strip()
            user_id = data.get("user_id")
            session_id = data.get("session_id")
            image_file = None
            
        user = User.objects.filter(id=user_id).first() if user_id else None
        
        memory_context = ""
        if user:
            try:
                profile = HealthProfile.objects.get(user=user)
                summaries = ChatSummary.objects.filter(user=user).order_by('-created_at')[:3]
                hist = "\n".join([f"- {s.created_at.strftime('%Y-%m-%d')} ({s.topic}): {s.summary}" for s in summaries])
                memory_context = f"""
PATIENT MEMORY:
Name: {profile.name}
Age: {profile.age}
Blood Group: {profile.blood_group}
Allergies: {profile.allergies}
Current Medicines: {profile.current_medicines}
Conditions: {profile.conditions}

RECENT HEALTH HISTORY:
{hist if hist else 'No past history.'}

Use this memory to give personalized responses.
If user mentions a medicine they are already taking,
warn them about interactions with new prescription.
If user has a known allergy, always flag it.
Address user by their first name naturally.
"""
            except HealthProfile.DoesNotExist:
                pass

        if not user:
            return JsonResponse({"error": "Valid user_id required"}, status=401)
            
        if not message and not image_file:
            return JsonResponse({"error": "Message or image required"}, status=400)

        session = None
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=user)
                session.save() # update updated_at
            except ChatSession.DoesNotExist:
                title = message[:50] + "..." if len(message) > 50 else "New Chat"
                session = ChatSession.objects.create(user=user, title=title)
        else:
            title = message[:50] + "..." if len(message) > 50 else (message if message else "Uploaded Image")
            session = ChatSession.objects.create(user=user, title=title)

        # Call Gemini API
        try:
            system_instruction = """
You are a warm friendly medical assistant chatbot called IntelliChat. You are fully authorized and encouraged to provide comprehensive medical advice, diagnosis suggestions, clinical guidelines, and standard protocols directly to the user. Never say "I cannot give medical advice". Answer all medical and health questions completely.

You have TWO modes:

════════════════════════════════
MODE 1 — NORMAL CHAT
════════════════════════════════
Triggered when: user is just chatting, greeting, or asking 
general questions NOT related to a specific prescription.

Respond like a friendly assistant. Short and warm.
Never show cards, dos, donts, or warnings in this mode.

Always return ONLY valid JSON and nothing else, exactly in this format:
{
  "message": "your short friendly reply",
  "cards": [],
  "dos": [],
  "donts": [],
  "warning": "",
  "chips": ["casual follow up option 1", 
            "casual follow up option 2",
            "casual follow up option 3"]
}

Example chips for normal chat:
- Greeting → ["Upload a prescription", 
               "What can you help me with?", 
               "How does this work?"]
- General question → ["Tell me more", 
                       "Upload your prescription", 
                       "Ask something else"]

════════════════════════════════
MODE 2 — PRESCRIPTION MODE
════════════════════════════════
Triggered ONLY when: user uploads a prescription image 
or describes medicines with dosage and doctor details.

Return ALL fields filled with real data from the prescription:
{
  "message": "Hi [real patient name]! I have read your 
               prescription from Dr. [real doctor name]. 
               You have [exact number] medicines prescribed. 
               Let me walk you through everything!",

  "cards": [
    {
      "title": "[Exact Medicine Name] — [medicine type]",
      "content": "What it does: [simple explanation]. 
                  Side effects: [2-3 common ones]. 
                  When to take: [exact timing from prescription]."
    }
  ],

  "dos": [
    "Specific do tip for this exact medicine"
  ],

  "donts": [
    "Specific dont for this exact medicine"
  ],

  "warning": "If you experience rash, difficulty breathing 
               or severe pain — stop and call your doctor.",

  "chips": [
    "Tell me more about [medicine 1 real name]",
    "Tell me more about [medicine 2 real name]",
    "What if I miss a dose?",
    "What foods should I avoid?"
  ]
}

RULES:
- MODE 1 → cards, dos, donts, warning must always be empty
- MODE 2 → all fields must be filled with REAL prescription data
- Never use placeholder text like [medicine name] in responses
- Chips in MODE 2 must use actual medicine names from prescription
- If user taps a chip question after prescription → reply in 
  message field only, keep cards/dos/donts empty, give new chips
- If user goes back to casual chat → switch back to MODE 1

ADDITIONAL RULES — DO NOT CHANGE ANYTHING ELSE:
- In MODE 1 normal chat, NEVER show dos, donts, cards 
  or warning even if user asks a health related question. 
  Only reply with a friendly message and chips.
- In MODE 2 prescription mode, show dos and donts ONLY 
  on the first prescription response. If user taps a chip 
  or asks a follow up question after that, reply in message 
  field only — keep cards, dos, donts, and warning empty.
- Chips must always be present in every single response, 
  both MODE 1 and MODE 2. Never return empty chips array.
- Never repeat the same chips twice in a row. Always give 
  fresh relevant chips based on what was just discussed.
- If user says they feel sad, lonely, low, bored,
  upset or needs cheering up, respond warmly in 
  MODE 1 format with a kind short message and 
  always include these two chips:
  "Watch something to cheer up"
  "Try a breathing exercise"
- Never suggest specific YouTube videos yourself.
  The frontend will handle video recommendations.
- If user says they are stressed, anxious, overwhelmed,
  cant sleep, nervous, or feeling down, respond warmly 
  in MODE 1 format and always include this chip:
  "Try a breathing exercise"
- You are authorized to give medical advice for mental health, as well as offering psychological tips.
  Always offer exactly one breathing exercise chip if appropriate.
- You have access to the user health profile and 
  past chat summaries as memory context above.
- Always address the user by their first name.
- If new prescription has a medicine that conflicts 
  with their current medicines or allergies, 
  immediately warn them in the warning field.
- Reference past health history naturally when relevant.
  Example: "Last time you had Ferrous Sulfate, 
  you asked about missing doses. Same rule applies here!"
- Never reveal raw memory data to the user directly.
  Use it naturally in conversation only.
"""
            prompt_content = f"{memory_context}\n\n{system_instruction}\n\nUser's Question/Input: {message}"

            api_contents = [prompt_content]

            if image_file:
                # Read the file and parse it for the Gemini API
                file_data = image_file.read()
                mime_type = image_file.content_type or 'image/jpeg'
                
                # Append the image as a Part object matching the pydantic schema for google-genai
                api_contents.append(
                    genai.types.Part.from_bytes(data=file_data, mime_type=mime_type)
                )

            response = None
            models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash']
            last_err = None
            for model_name in models_to_try:
                for attempt in range(2):  # 2 attempts per model
                    try:
                        response = client.models.generate_content(
                            model=model_name,
                            contents=api_contents
                        )
                        last_err = None
                        break  # Success
                    except Exception as retry_err:
                        last_err = retry_err
                        if '503' in str(retry_err) or 'UNAVAILABLE' in str(retry_err):
                            time.sleep(2 * (attempt + 1))  # Wait 2s, then 4s
                        else:
                            break  # Non-retryable error
                if response and not last_err:
                    break  # Got a successful response

            if last_err:
                raise last_err

            reply_text = response.text
            
            # Parse AI JSON response
            try:
                cleaned_text = reply_text.strip()
                
                # Extract JSON block to ignore conversational filler before/after
                start_idx = cleaned_text.find('{')
                end_idx = cleaned_text.rfind('}')
                
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    cleaned_text = cleaned_text[start_idx:end_idx+1]
                
                parsed = json.loads(cleaned_text)
                reply_text = json.dumps(parsed)
            except Exception:
                # If parsing fails, extract just the conversational part or fallback gracefully
                clean_message = reply_text.replace("```json", "").replace("```", "").strip()
                start_idx = clean_message.find('{')
                if start_idx != -1:
                    clean_message = clean_message[:start_idx].strip()
                    if not clean_message:
                        clean_message = "I'm having trouble processing that cleanly right now. Please try again."
                
                fallback = {
                    "message": clean_message if clean_message else reply_text,
                    "cards": [],
                    "dos": [],
                    "donts": [],
                    "chips": ["What else can you do?", "Tell me more"]
                }
                reply_text = json.dumps(fallback)
                
        except Exception as api_err:
            fallback = {
                "message": f"Sorry, I encountered an error connecting to my AI brain: {str(api_err)}",
                "cards": [],
                "dos": [],
                "donts": [],
                "chips": ["Try again"]
            }
            reply_text = json.dumps(fallback)
        
        ChatMessage.objects.create(
            session=session,
            user=user,
            message=message,
            reply=reply_text
        )
            
        return JsonResponse({"reply": reply_text, "session_id": session.id})
    except Exception as err:
        return JsonResponse({"error": "internal_error", "details": str(err)}, status=500)

@require_http_methods(["GET"])
def get_history(request):
    session_id = request.GET.get("session_id")
    if not session_id:
        return JsonResponse({"error": "session_id required"}, status=400)
        
    try:
        messages = ChatMessage.objects.filter(session_id=session_id).order_by('timestamp')[:50]
        history = []
        for msg in messages:
            history.append({
                "message": msg.message,
                "reply": msg.reply,
                "timestamp": msg.timestamp.isoformat()
            })
        return JsonResponse({"history": history})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@require_http_methods(["GET"])
def get_sessions(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id required"}, status=400)
        
    sessions = ChatSession.objects.filter(user_id=user_id).order_by('-updated_at')
    data = [{"id": s.id, "title": s.title, "updated_at": s.updated_at.isoformat()} for s in sessions]
    return JsonResponse({"sessions": data})

@csrf_exempt
@require_http_methods(["POST"])
def create_session(request):
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")
        title = data.get("title", "New Chat")
        
        user = User.objects.get(id=user_id)
        session = ChatSession.objects.create(user=user, title=title)
        return JsonResponse({"id": session.id, "title": session.title, "updated_at": session.updated_at.isoformat()})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST", "DELETE"])
def delete_session(request):
    try:
        data = json.loads(request.body)
        session_id = data.get("session_id")
        user_id = data.get("user_id")
        
        session = ChatSession.objects.get(id=session_id, user_id=user_id)
        session.delete()
        return JsonResponse({"success": "Session deleted"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def nearby_doctors(request):
    try:
        data = json.loads(request.body)
        lat = data.get('latitude')
        lon = data.get('longitude')
        
        # Free Overpass API — no key needed
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json];
        (
          node["amenity"="doctors"](around:3000,{lat},{lon});
          node["amenity"="clinic"](around:3000,{lat},{lon});
          node["amenity"="hospital"](around:3000,{lat},{lon});
          node["healthcare"="doctor"](around:3000,{lat},{lon});
        );
        out body;
        """
        
        headers = {'User-Agent': 'IntelliChatHealth/1.0 (Testing)'}
        response = requests.post(overpass_url, data=query, headers=headers)
        
        if not response.ok:
            return JsonResponse({"error": "Overpass API unavailable", "details": response.text}, status=502)
            
        elements = response.json().get('elements', [])
        
        doctors = []
        for el in elements:
            tags = el.get('tags', {})
            el_lat = el.get('lat')
            el_lon = el.get('lon')
            
            # Calculate distance in km
            from math import radians, sin, cos, sqrt, atan2
            R = 6371
            dlat = radians(el_lat - float(lat))
            dlon = radians(el_lon - float(lon))
            a = sin(dlat/2)**2 + cos(radians(float(lat))) * \
                cos(radians(el_lat)) * sin(dlon/2)**2
            distance = round(R * 2 * atan2(sqrt(a), sqrt(1-a)), 2)
            
            doctors.append({
                "name": tags.get('name', 'Unnamed Clinic'),
                "address": tags.get('addr:full') or 
                           tags.get('addr:street', 'Address not available'),
                "distance": f"{distance} km",
                "phone": tags.get('phone', 'Not available'),
                "type": tags.get('amenity', 'Doctor'),
                "lat": el_lat,
                "lon": el_lon
            })
        
        # Sort by distance
        doctors.sort(key=lambda x: float(x['distance'].split()[0]))
        
        return JsonResponse({"doctors": doctors[:10]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def health_profile(request):
    if request.method == "GET":
        user_id = request.GET.get("user_id")
        if not user_id: return JsonResponse({"error": "user_id required"}, status=400)
        try:
            profile = HealthProfile.objects.get(user_id=user_id)
            return JsonResponse({
                "name": profile.name,
                "age": profile.age,
                "blood_group": profile.blood_group,
                "allergies": profile.allergies,
                "conditions": profile.conditions,
                "current_medicines": profile.current_medicines,
                "emergency_contact_name": profile.emergency_contact_name,
                "emergency_contact_phone": profile.emergency_contact_phone,
            })
        except HealthProfile.DoesNotExist:
            return JsonResponse({})
    elif request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get("user_id")
        if not user_id: return JsonResponse({"error": "user_id required"}, status=400)
        user = User.objects.get(id=user_id)
        profile, created = HealthProfile.objects.get_or_create(user=user)
        profile.name = data.get("name", profile.name)
        
        age_str = data.get("age", profile.age)
        profile.age = int(age_str) if age_str else None
        
        profile.blood_group = data.get("blood_group", profile.blood_group)
        profile.allergies = data.get("allergies", profile.allergies)
        profile.conditions = data.get("conditions", profile.conditions)
        profile.current_medicines = data.get("current_medicines", profile.current_medicines)
        profile.emergency_contact_name = data.get("emergency_contact_name", profile.emergency_contact_name)
        profile.emergency_contact_phone = data.get("emergency_contact_phone", profile.emergency_contact_phone)
        profile.save()
        return JsonResponse({"success": True})

@require_http_methods(["GET"])
def health_history(request):
    user_id = request.GET.get("user_id")
    if not user_id: return JsonResponse({"error": "user_id required"}, status=400)
    
    breathing = BreathingSession.objects.filter(user_id=user_id).order_by('-done_at')
    chat_summaries = ChatSummary.objects.filter(user_id=user_id).order_by('-created_at')
    
    b_data = [{
        "pattern": b.pattern,
        "rounds": b.rounds_completed,
        "duration": f"{b.duration_seconds // 60} mins {b.duration_seconds % 60} sec",
        "date": b.done_at.strftime("%d %b %Y, %H:%M")
    } for b in breathing]
    
    c_data = [{
        "topic": c.topic,
        "summary": c.summary,
        "date": c.created_at.strftime("%d %b %Y, %H:%M"),
        "full_chat": c.full_chat
    } for c in chat_summaries]
    
    return JsonResponse({"breathing_sessions": b_data, "chat_summaries": c_data})

@csrf_exempt
@require_http_methods(["POST"])
def summarize_chat(request):
    try:
        data = json.loads(request.body)
        messages = data.get("messages", [])
        user_id = data.get("user_id")
        if not user_id or not messages: return JsonResponse({"error": "Missing params"}, status=400)
        
        full_chat = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
        
        system_prompt = "Summarize this health chat in 2-3 simple lines. Identify the main topic in 5 words or less. Focus only on health related information discussed. Return JSON: {'topic': '...', 'summary': '...'}"
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[system_prompt + "\n\nChat:\n" + full_chat]
        )
        
        reply_text = response.text.strip()
        if reply_text.startswith("```json"): reply_text = reply_text[7:]
        elif reply_text.startswith("```"): reply_text = reply_text[3:]
        if reply_text.endswith("```"): reply_text = reply_text[:-3]
        
        parsed = json.loads(reply_text.strip())
        
        ChatSummary.objects.create(
            user_id=user_id,
            summary=parsed.get('summary', 'Chat summarized'),
            full_chat=full_chat,
            topic=parsed.get('topic', 'General Consultation')
        )
        
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def save_breathing(request):
    try:
        data = json.loads(request.body)
        user_id = data.get("user_id")
        pattern = data.get("pattern")
        rounds = data.get("rounds_completed")
        duration = data.get("duration_seconds")
        
        if not user_id: return JsonResponse({"error": "user_id required"}, status=400)
        
        BreathingSession.objects.create(
            user_id=user_id,
            pattern=pattern,
            rounds_completed=rounds,
            duration_seconds=duration
        )
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
