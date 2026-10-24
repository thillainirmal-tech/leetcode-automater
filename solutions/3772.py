from typing import List
from collections import defaultdict

class Solution:
    def maxSubgraphScore(self, n: int, edges: List[List[int]], good: List[int]) -> List[int]:
        score = [1 if x == 1 else -1 for x in good]
        tree = defaultdict(list)
        for u, v in edges:
            tree[u].append(v)
            tree[v].append(u)

        dp = [0] * n

        def post_order(node: int, parent: int) -> int:
            total = score[node]
            for child in tree[node]:
                if child == parent:
                    continue
                child_score = post_order(child, node)
                if child_score > 0:
                    total += child_score
            dp[node] = total
            return total

        def pre_order(node: int, parent: int):
            for child in tree[node]:
                if child == parent:
                    continue
                # Remove child's contribution if positive, then add parent's contribution if positive
                child_contrib = max(0, dp[child])
                dp[child] = dp[child] + max(0, dp[node] - child_contrib)
                pre_order(child, node)

        post_order(0, -1)
        pre_order(0, -1)
        return dp
