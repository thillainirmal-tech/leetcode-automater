import pandas as pd


def users_percentage(users: pd.DataFrame, register: pd.DataFrame) -> pd.DataFrame:
    total_users = len(users)
    result = register.groupby("contest_id", as_index=False)["user_id"].nunique()
    result["percentage"] = (result["user_id"] * 100 / total_users).round(2)
    return result[["contest_id", "percentage"]].sort_values(
        ["percentage", "contest_id"], ascending=[False, True]
    )
