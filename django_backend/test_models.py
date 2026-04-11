import google.generativeai as genai
genai.configure(api_key='AIzaSyBrG4xI4wjomXySWxmyEWKe4tJ4430PlFg')
models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
with open("models_utf8.txt", "w", encoding="utf-8") as f:
    for m in models:
        f.write(m + "\n")
