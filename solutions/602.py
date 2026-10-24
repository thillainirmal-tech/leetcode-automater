import pandas as pd


def most_friends(request_accepted: pd.DataFrame) -> pd.DataFrame:
    people = pd.concat(
        [request_accepted["requester_id"], request_accepted["accepter_id"]],
        ignore_index=True,
    )
    counts = people.value_counts()
    return pd.DataFrame({"id": [counts.index[0]], "num": [counts.iloc[0]]})
