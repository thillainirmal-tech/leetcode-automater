import pandas as pd


def find_product_recommendation_pairs(
    product_purchases: pd.DataFrame, product_info: pd.DataFrame
) -> pd.DataFrame:
    pairs = product_purchases.merge(product_purchases, on="user_id")
    pairs = pairs[pairs["product_id_x"] < pairs["product_id_y"]]
    counts = pairs.groupby(["product_id_x", "product_id_y"], as_index=False)["user_id"].nunique()
    counts = counts.rename(columns={
        "product_id_x": "product1_id", "product_id_y": "product2_id", "user_id": "customer_count"
    })
    counts = counts[counts["customer_count"] >= 3]
    first = product_info[["product_id", "category"]].rename(
        columns={"product_id": "product1_id", "category": "product1_category"}
    )
    second = product_info[["product_id", "category"]].rename(
        columns={"product_id": "product2_id", "category": "product2_category"}
    )
    result = counts.merge(first, on="product1_id").merge(second, on="product2_id")
    return result[[
        "product1_id", "product2_id", "product1_category", "product2_category", "customer_count"
    ]].sort_values(["customer_count", "product1_id", "product2_id"], ascending=[False, True, True])
