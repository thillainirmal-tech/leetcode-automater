import pandas as pd


def capital_gainloss(stocks: pd.DataFrame) -> pd.DataFrame:
    values = stocks["price"].where(stocks["operation"] == "Sell", -stocks["price"])
    return stocks.assign(capital_gain_loss=values).groupby(
        "stock_name", as_index=False
    )["capital_gain_loss"].sum()
