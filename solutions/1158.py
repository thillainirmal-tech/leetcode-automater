import pandas as pd


def market_analysis(users: pd.DataFrame, orders: pd.DataFrame, items: pd.DataFrame) -> pd.DataFrame:
    dates = pd.to_datetime(orders["order_date"])
    counts = orders[dates.dt.year == 2019].groupby("buyer_id").size()
    result = users[["user_id", "join_date"]].rename(columns={"user_id": "buyer_id"})
    result["orders_in_2019"] = result["buyer_id"].map(counts).fillna(0).astype(int)
    return result
