import json

def hex_to_ass_color(hex_color: str) -> str:
    """Convert hex color (#RRGGBB) to ASS format (&HAABBGGRR)"""
    if not hex_color or hex_color == "transparent":
        return "&H00000000&"
    
    hex_color = hex_color.lstrip('#')
    
    if len(hex_color) == 8:  # RGBA
        alpha = hex_color[0:2]
        rgb = hex_color[2:]
        b = rgb[4:6]
        g = rgb[2:4]
        r = rgb[0:2]
        return f"&H{alpha}{b}{g}{r}&"
    elif len(hex_color) == 6:  # RGB
        b = hex_color[4:6]
        g = hex_color[2:4]
        r = hex_color[0:2]
        return f"&H00{b}{g}{r}&"
    
    return "&H00FFFFFF&"  # Default white

def render_ass(segments, ass_path, plan):
    """
    Generate animated ASS subtitles from Whisper segments
    """
    
    # Extract theme settings
    theme_settings = plan.get("theme_settings", {})
    theme = theme_settings.get("theme", "default")
    
    # Extract caption settings with defaults
    captions = theme_settings.get("captions", {})
    font_size = captions.get("fontSize", 32)
    bold = captions.get("bold", True)
    italic = captions.get("italic", False)
    font_color = captions.get("fontColor", "#FFFFFF")
    bg_color = captions.get("backgroundColor", "#00000080")
    position = captions.get("position", "bottom")
    
    # Position mapping
    position_map = {
        "top": 8,
        "middle": 5, 
        "bottom": 2
    }
    alignment = position_map.get(position, 2)
    margin_v = 30 if position == "top" else 80 if position == "bottom" else 360
    
    # Font weight
    bold_val = -1 if bold else 0
    italic_val = -1 if italic else 0
    
    # Convert colors
    font_color_ass = hex_to_ass_color(font_color)
    bg_color_ass = hex_to_ass_color(bg_color)
    
    # ASS header
    HEADER = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,{font_size},{font_color_ass},{font_color_ass},{bg_color_ass},&H00000000,{bold_val},{italic_val},0,0,100,100,0,0,1,2,0,{alignment},60,60,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    
    def ts(t):
        """Convert seconds to ASS timestamp"""
        h = int(t // 3600)
        m = int((t % 3600) // 60)
        s = t % 60
        return f"{h}:{m:02d}:{s:05.2f}"
    
    lines = [HEADER]
    
    # Animation based on theme
    animations = {
        "default": r"{\fscx100\fscy100\fad(150,150)}",
        "pop": r"{\fscx120\fscy120\t(0,200,\fscx100\fscy100)\fad(120,120)}",
        "fade": r"{\fad(300,300)}",
        "bold": r"{\fad(100,100)\b1}",
        "cinematic": r"{\fad(300,300)}"
    }
    
    animation = animations.get(theme, animations["default"])
    
    for idx, seg in enumerate(segments):
        start = ts(seg["start"])
        end = ts(seg["end"])
        text = seg["text"].strip()
        
        if not text:
            continue
        
        # Simple word wrapping
        if len(text) > 40:
            words = text.split()
            lines_text = []
            current_line = []
            
            for word in words:
                current_line.append(word)
                if len(" ".join(current_line)) > 35:
                    lines_text.append(" ".join(current_line[:-1]))
                    current_line = [current_line[-1]]
            
            if current_line:
                lines_text.append(" ".join(current_line))
            
            text = "\\N".join(lines_text)
        
        line = f"Dialogue: 0,{start},{end},Default,,0,0,0,,{animation}{text}"
        lines.append(line)
    
    # Write ASS file
    with open(ass_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    
    print(f"✅ ASS file created with {len(lines)-1} caption lines")
    return ass_path