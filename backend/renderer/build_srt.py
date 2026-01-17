import json

def seconds_to_srt_time(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{hrs:02}:{mins:02}:{secs:02},{ms:03}"

def build_srt(plan_path: str, srt_path: str):
    with open(plan_path, "r", encoding="utf-8") as f:
        plan = json.load(f)
    
    lines = []
    idx = 1
    
    # Get theme settings for animation
    theme_settings = plan.get("theme_settings", {})
    theme = theme_settings.get("theme", "default")
    
    # Animation based on theme
    animations = {
        "pop": r"{\fad(120,120)\fscx110\fscy110}",
        "fade": r"{\fad(200,200)}",
        "default": r"{\fad(150,150)}",
        "bold": r"{\fad(100,100)\b1}",
        "cinematic": r"{\fad(300,300)}",
        "minimal": r"{}"
    }
    
    anim = animations.get(theme, animations["default"])
    
    for s in plan["segments"]:
        start = seconds_to_srt_time(s["start"])
        end = seconds_to_srt_time(s["end"])
        
        text = anim + s["text"].strip()
        
        lines.append(str(idx))
        lines.append(f"{start} --> {end}")
        lines.append(text)
        lines.append("")
        idx += 1
    
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    
    return srt_path