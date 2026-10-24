import pandas as pd


def find_employees(employees: pd.DataFrame, salaries: pd.DataFrame) -> pd.DataFrame:
    employee_ids = set(employees["employee_id"])
    salary_ids = set(salaries["employee_id"])
    return pd.DataFrame({"employee_id": sorted(employee_ids ^ salary_ids)})
