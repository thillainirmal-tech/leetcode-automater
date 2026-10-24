import pandas as pd


def fix_names(users: pd.DataFrame) -> pd.DataFrame:
    users = users.copy()
    users["name"] = users["name"].str.capitalize()
    return users.sort_values("user_id")
