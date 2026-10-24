import pandas as pd
import re


def capitalize_content(user_content: pd.DataFrame) -> pd.DataFrame:
    def convert(text: str) -> str:
        converted = []
        for word in text.split(" "):
            if not word or not (word[0].isascii() and word[0].isalpha()):
                converted.append(word)
            elif re.fullmatch(r"[A-Za-z]+(?:-[A-Za-z]+)+", word):
                converted.append("-".join(part.capitalize() for part in word.split("-")))
            else:
                tail = "".join(
                    char.lower() if char.isascii() and char.isalpha() else char
                    for char in word[1:]
                )
                converted.append(word[0].upper() + tail)
        return " ".join(converted)

    result = user_content.copy()
    result["converted_text"] = result["content_text"].map(convert)
    return result.rename(columns={"content_text": "original_text"})[
        ["content_id", "original_text", "converted_text"]
    ]
