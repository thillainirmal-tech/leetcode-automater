import pandas as pd


def find_primary_department(employee: pd.DataFrame) -> pd.DataFrame:
    counts = employee.groupby("employee_id")["department_id"].transform("count")
    result = employee[(counts == 1) | (employee["primary_flag"] == "Y")]
    return result[["employee_id", "department_id"]]
