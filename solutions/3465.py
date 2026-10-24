import pandas as pd


def find_valid_serial_products(products: pd.DataFrame) -> pd.DataFrame:
    pattern = r"(?<![A-Za-z0-9])SN[0-9]{4}-[0-9]{4}(?![A-Za-z0-9])"
    result = products[products["description"].str.contains(pattern, regex=True, na=False)]
    return result.sort_values("product_id")
