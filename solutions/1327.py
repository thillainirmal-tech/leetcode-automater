import pandas as pd


def list_products(products: pd.DataFrame, orders: pd.DataFrame) -> pd.DataFrame:
    dates = pd.to_datetime(orders["order_date"])
    february = orders[(dates >= "2020-02-01") & (dates < "2020-03-01")]
    totals = february.groupby("product_id", as_index=False)["unit"].sum()
    totals = totals[totals["unit"] >= 100]
    return products.merge(totals, on="product_id")[["product_name", "unit"]]
