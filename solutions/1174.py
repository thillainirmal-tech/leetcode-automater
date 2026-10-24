import pandas as pd


def immediate_food_delivery(delivery: pd.DataFrame) -> pd.DataFrame:
    first = delivery.loc[delivery.groupby("customer_id")["order_date"].idxmin()]
    percentage = (first["order_date"] == first["customer_pref_delivery_date"]).mean() * 100
    return pd.DataFrame({"immediate_percentage": [round(percentage, 2)]})
