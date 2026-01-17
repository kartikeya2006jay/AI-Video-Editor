def apply_chat_command(command: str, edit_plan: dict):
    cmd = command.lower()

    if "bold" in cmd:
        edit_plan["style"]["bold"] = True
    if "italic" in cmd:
        edit_plan["style"]["italic"] = True
    if "yellow" in cmd:
        edit_plan["style"]["color"] = "yellow"
    if "remove animation" in cmd:
        edit_plan["style"]["animation"] = "none"

    return edit_plan
