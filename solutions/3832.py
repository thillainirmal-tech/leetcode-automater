import pandas as pd


def find_behaviorally_stable_users(activity: pd.DataFrame) -> pd.DataFrame:
    data = activity.copy()
    data["action_date"] = pd.to_datetime(data["action_date"])
    daily = data.groupby(["user_id", "action_date"])["action"].transform("size")
    data = data[daily == 1].sort_values(["user_id", "action", "action_date"])
    order = data.groupby(["user_id", "action"]).cumcount() + 1
    data["group_key"] = data["action_date"] - pd.to_timedelta(order, unit="D")
    runs = data.groupby(["user_id", "action", "group_key"]).agg(
        streak_length=("action_date", "size"),
        start_date=("action_date", "min"),
        end_date=("action_date", "max"),
    ).reset_index()
    runs = runs[runs["streak_length"] >= 5].sort_values(
        ["streak_length", "user_id"], ascending=[False, True]
    )
    return runs.drop_duplicates("user_id")[[
        "user_id", "action", "streak_length", "start_date", "end_date"
    ]]
