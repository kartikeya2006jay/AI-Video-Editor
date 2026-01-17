def get_theme_filter(theme: str) -> str:
    if theme == "contrast":
        return "eq=contrast=1.4:saturation=1.4"
    if theme == "cinematic":
        return "eq=brightness=-0.05:contrast=1.2:saturation=0.9"
    if theme == "bw":
        return "hue=s=0"
    if theme == "painting":
        return "boxblur=2:1,eq=saturation=1.8"
    return ""
