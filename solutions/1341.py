import pandas as pd


def movie_rating(movies: pd.DataFrame, users: pd.DataFrame, movie_rating: pd.DataFrame) -> pd.DataFrame:
    user_counts = movie_rating.groupby("user_id", as_index=False).size()
    top_user = users.merge(user_counts, on="user_id").sort_values(
        ["size", "name"], ascending=[False, True]
    ).iloc[0]["name"]

    dates = pd.to_datetime(movie_rating["created_at"])
    february = movie_rating[(dates >= "2020-02-01") & (dates < "2020-03-01")]
    averages = february.groupby("movie_id", as_index=False)["rating"].mean()
    top_movie = movies.merge(averages, on="movie_id").sort_values(
        ["rating", "title"], ascending=[False, True]
    ).iloc[0]["title"]
    return pd.DataFrame({"results": [top_user, top_movie]})
