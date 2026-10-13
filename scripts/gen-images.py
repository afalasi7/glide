import base64, json, os, sys, urllib.request
key = os.environ["GEMINI_API_KEY"]
MODEL = "gemini-3-pro-image"
OUT = "public/images/4k"
os.makedirs(OUT, exist_ok=True)
JOBS = {
  "jebel_jais_sunset": ("public/images/jebel_jais_sunset.jpg", "Recreate this exact scene as a razor-sharp, photorealistic 4K landscape photograph: Jebel Jais mountain viewing deck at golden-hour sunset, warm light, crisp rock detail, no text, no signs, no people close up."),
  "ic_rak_resort": ("public/images/ic_rak_resort.jpg", "Recreate this exact scene as a razor-sharp, photorealistic 4K architectural photograph of the resort hotel, same composition and mood, fine detail, no text overlays."),
  "levant_nar_dining": ("public/images/levant_nar_dining.jpg", "Recreate this exact scene as a razor-sharp, photorealistic 4K photograph of the restaurant terrace dinner setting, same composition and warm evening light, fine detail, no text overlays."),
  "traffic_road": ("public/images/traffic_road.jpg", "Recreate this exact scene as a razor-sharp, photorealistic 4K photograph of the highway traffic at dusk. Remove ALL road signs, gantries and any text; show only road, cars and sky."),
}
only = sys.argv[1:] or list(JOBS)
for name in only:
    src, prompt = JOBS[name]
    img = base64.b64encode(open(src, "rb").read()).decode()
    body = {"contents": [{"parts": [{"text": prompt}, {"inline_data": {"mime_type": "image/jpeg", "data": img}}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "16:9", "imageSize": "4K"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=300))
    except Exception as e:
        print(name, "ERR", getattr(e, "read", lambda: b"")()[:300] or e); continue
    for p in r["candidates"][0]["content"]["parts"]:
        d = p.get("inlineData") or p.get("inline_data")
        if d:
            open(f"{OUT}/{name}.png", "wb").write(base64.b64decode(d["data"])); print(name, "ok"); break
    else:
        print(name, "no image", json.dumps(r)[:300])
