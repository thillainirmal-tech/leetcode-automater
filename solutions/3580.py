import pandas as pd


def find_consistently_improving_employees(
    employees: pd.DataFrame, performance_reviews: pd.DataFrame
) -> pd.DataFrame:
    reviews = performance_reviews.sort_values(["employee_id", "review_date"], ascending=[True, False]).copy()
    reviews["rn"] = reviews.groupby("employee_id").cumcount() + 1
    reviews["delta"] = reviews.groupby("employee_id")["rating"].shift(1) - reviews["rating"]
    recent = reviews[(reviews["rn"] > 1) & (reviews["rn"] <= 3)]
    improvement = recent.groupby("employee_id").agg(
        improvement_score=("delta", "sum"),
        review_count=("delta", "count"),
        minimum_improvement=("delta", "min"),
    ).reset_index()
    improvement = improvement[(improvement["review_count"] == 2) & (improvement["minimum_improvement"] > 0)]
    result = improvement.merge(employees[["employee_id", "name"]], on="employee_id")
    return result.sort_values(["improvement_score", "name"], ascending=[False, True])[
        ["employee_id", "name", "improvement_score"]
    ]
