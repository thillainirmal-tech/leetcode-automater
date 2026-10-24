class Solution:
    MOD = 10**9 + 7

    def countArrays(self, digitSum: list[int]) -> int:
        from collections import defaultdict

        # Step 1: Precompute numbers by digit sum
        sum_to_numbers = defaultdict(list)
        for num in range(5001):
            s = sum(int(d) for d in str(num))
            sum_to_numbers[s].append(num)

        n = len(digitSum)
        if n == 0:
            return 0

        # Step 2: Initialize DP
        prev_dp = {}
        for num in sum_to_numbers.get(digitSum[0], []):
            prev_dp[num] = 1

        if not prev_dp:
            return 0

        # Step 3: DP iteration
        for i in range(1, n):
            curr_dp = {}
            numbers = sum_to_numbers.get(digitSum[i], [])
            if not numbers:
                return 0
            sorted_prev = sorted(prev_dp.keys())
            prefix = []
            total = 0
            for num in sorted_prev:
                total = (total + prev_dp[num]) % self.MOD
                prefix.append((num, total))

            for x in numbers:
                # Binary search to find sum of all prev_dp[num] where num <= x
                l, r = 0, len(prefix)-1
                idx = -1
                while l <= r:
                    m = (l + r)//2
                    if prefix[m][0] <= x:
                        idx = m
                        l = m+1
                    else:
                        r = m-1
                if idx != -1:
                    curr_dp[x] = prefix[idx][1]
            prev_dp = curr_dp

        return sum(prev_dp.values()) % self.MOD
