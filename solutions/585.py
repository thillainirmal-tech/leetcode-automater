import pandas as pd


def find_investments(insurance: pd.DataFrame) -> pd.DataFrame:
    repeated = insurance["tiv_2015"].duplicated(keep=False)
    unique_location = ~insurance.duplicated(subset=["lat", "lon"], keep=False)
    total = insurance.loc[repeated & unique_location, "tiv_2016"].sum()
    return pd.DataFrame({"tiv_2016": [round(total, 2)]})
