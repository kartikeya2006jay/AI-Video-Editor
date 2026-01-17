def get_theme_style(theme: str):
    """
    Returns FFmpeg subtitle force_style string
    """

    THEMES = {
        "default": {
            "FontSize": 28,
            "PrimaryColour": "&HFFFFFF&",
            "OutlineColour": "&H000000&",
            "Outline": 2,
            "Shadow": 0,
            "Alignment": 2  # bottom-center
        },

        "bold": {
            "FontSize": 34,
            "PrimaryColour": "&H00FFFF&",
            "OutlineColour": "&H000000&",
            "Outline": 3,
            "Shadow": 1,
            "Alignment": 2
        },

        "cinematic": {
            "FontSize": 26,
            "PrimaryColour": "&HFFFFFF&",
            "OutlineColour": "&H1A1A1A&",
            "Outline": 1,
            "Shadow": 1,
            "Alignment": 2
        },

        "minimal": {
            "FontSize": 24,
            "PrimaryColour": "&HEEEEEE&",
            "OutlineColour": "&H000000&",
            "Outline": 0,
            "Shadow": 0,
            "Alignment": 2
        }
    }

    style = THEMES.get(theme, THEMES["default"])

    return ",".join([f"{k}={v}" for k, v in style.items()])