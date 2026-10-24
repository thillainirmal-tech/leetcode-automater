import pandas as pd


def user_activity(activity: pd.DataFrame) -> pd.DataFrame:
    dates = pd.to_datetime(activity["activity_date"])
    recent = activity[(dates >= "2019-06-28") & (dates <= "2019-07-27")]
    result = recent.groupby("activity_date", as_index=False)["user_id"].nunique()
    return result.rename(columns={"activity_date": "day", "user_id": "active_users"})
