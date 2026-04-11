import os
import google.generativeai as genai
genai.configure(api_key=os.environ.get('GEMINI_API_KEY', ''))
models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
with open("models_utf8.txt", "w", encoding="utf-8") as f:
    for m in models:
        f.write(m + "\n")
