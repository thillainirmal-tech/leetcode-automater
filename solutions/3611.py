import pandas as pd


def find_overbooked_employees(employees: pd.DataFrame, meetings: pd.DataFrame) -> pd.DataFrame:
    meetings = meetings.copy()
    meetings["meeting_date"] = pd.to_datetime(meetings["meeting_date"])
    calendar = meetings["meeting_date"].dt.isocalendar()
    meetings["year"] = calendar.year
    meetings["week"] = calendar.week
    weekly = meetings.groupby(["employee_id", "year", "week"], as_index=False)["duration_hours"].sum()
    heavy = weekly[weekly["duration_hours"] >= 20].groupby("employee_id").size().reset_index(name="meeting_heavy_weeks")
    result = employees.merge(heavy, on="employee_id")
    result = result[result["meeting_heavy_weeks"] >= 2]
    return result.sort_values(["meeting_heavy_weeks", "employee_name"], ascending=[False, True])[
        ["employee_id", "employee_name", "department", "meeting_heavy_weeks"]
    ]
