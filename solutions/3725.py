from math import gcd
from typing import List
from collections import defaultdict

class Solution:
    def countCoprime(self, mat: List[List[int]]) -> int:
        MOD = 10**9 + 7
        dp = defaultdict(int)
        dp[0] = 1  # Start with "no number chosen"

        for row in mat:
            next_dp = defaultdict(int)
            for num in row:
                for g, count in dp.items():
                    new_gcd = gcd(g, num)
                    next_dp[new_gcd] = (next_dp[new_gcd] + count) % MOD
            dp = next_dp

        return dp[1] if 1 in dp else 0
