import pandas as pd


def sales_analysis(product: pd.DataFrame, sales: pd.DataFrame) -> pd.DataFrame:
    dates = pd.to_datetime(sales["sale_date"])
    dated_sales = sales.assign(sale_date=dates)
    ranges = dated_sales.groupby("product_id", as_index=False).agg(
        first_sale=("sale_date", "min"), last_sale=("sale_date", "max")
    )
    valid = ranges[(ranges["first_sale"] >= "2019-01-01") & (ranges["last_sale"] <= "2019-03-31")]
    return product.merge(valid, on="product_id")[["product_id", "product_name"]]
