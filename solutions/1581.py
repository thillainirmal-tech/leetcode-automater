import pandas as pd


def find_customers(visits: pd.DataFrame, transactions: pd.DataFrame) -> pd.DataFrame:
    without_transaction = visits[~visits["visit_id"].isin(transactions["visit_id"])]
    return without_transaction.groupby("customer_id").size().reset_index(name="count_no_trans")
