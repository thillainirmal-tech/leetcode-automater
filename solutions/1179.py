import pandas as pd


def reformat_table(department: pd.DataFrame) -> pd.DataFrame:
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    result = department.pivot(index="id", columns="month", values="revenue")
    for month in months:
        if month not in result.columns:
            result[month] = pd.NA
    result = result[months].reset_index()
    return result.rename(columns={month: f"{month}_Revenue" for month in months})
