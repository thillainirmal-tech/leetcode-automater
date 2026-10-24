import pandas as pd


def find_loyal_customers(customer_transactions: pd.DataFrame) -> pd.DataFrame:
    customer_transactions = customer_transactions.copy()
    customer_transactions["transaction_date"] = pd.to_datetime(
        customer_transactions["transaction_date"]
    )
    summary = customer_transactions.groupby("customer_id").agg(
        transaction_count=("transaction_type", "size"),
        refund_count=("transaction_type", lambda values: values.eq("refund").sum()),
        first_transaction=("transaction_date", "min"),
        last_transaction=("transaction_date", "max"),
    )

    loyal = summary[
        (summary["transaction_count"] >= 3)
        & (summary["refund_count"] / summary["transaction_count"] < 0.2)
        & ((summary["last_transaction"] - summary["first_transaction"]).dt.days >= 30)
    ]
    return loyal.reset_index()[["customer_id"]].sort_values("customer_id")
