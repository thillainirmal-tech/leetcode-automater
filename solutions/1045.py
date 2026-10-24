import pandas as pd


def find_customers(customer: pd.DataFrame, product: pd.DataFrame) -> pd.DataFrame:
    required = product["product_key"].nunique()
    counts = customer.groupby("customer_id")["product_key"].nunique()
    return counts[counts == required].index.to_frame(index=False)
