from typing import List

class Solution:
    def maximumScore(self, nums: List[int], k: int) -> int:
        n = len(nums)

        max_idx = max(range(n), key=lambda i: nums[i])

        def solve(start: int, end: int) -> int:
            NEG_INF = -(10 ** 30)

            dp = [[NEG_INF] * 3 for _ in range(k + 2)]
            dp[0][0] = 0

            for idx in range(start, end):
                value = nums[idx % n]

                for used in range(k + 1, 0, -1):
                    dp[used][0] = max(
                        dp[used][0],
                        dp[used][1] + value,
                        dp[used][2] - value,
                    )

                    dp[used][1] = max(
                        dp[used][1],
                        dp[used - 1][0] - value,
                    )

                    dp[used][2] = max(
                        dp[used][2],
                        dp[used - 1][0] + value,
                    )

            return max(0, max(dp[used][0] for used in range(1, k + 1)))

        answer1 = solve(max_idx, max_idx + n)
        answer2 = solve(max_idx + 1, max_idx + 1 + n)

        return max(answer1, answer2)
