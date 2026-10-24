from typing import List


class Solution:
    def minOperations(self, nums: List[int], k: int) -> int:
        n = len(nums)
        if k == 0:
            return 0
        if k > n // 2:
            return -1
        if n == 2:
            return min(
                max(0, nums[1] + 1 - nums[0]),
                max(0, nums[0] + 1 - nums[1]),
            )

        costs = [
            max(0, max(nums[index - 1], nums[(index + 1) % n]) + 1 - nums[index])
            for index in range(n)
        ]
        infinity = 10**18

        def path_exact(weights: List[int], wanted: int) -> int:
            if wanted == 0:
                return 0
            two_back = [infinity] * (wanted + 1)
            two_back[0] = 0
            one_back = two_back[:]
            for index, weight in enumerate(weights):
                current = one_back[:]
                upper = min(wanted, (index + 2) // 2)
                for count in range(1, upper + 1):
                    candidate = two_back[count - 1] + weight
                    if candidate < current[count]:
                        current[count] = candidate
                two_back, one_back = one_back, current
            return one_back[wanted]

        exclude_first = path_exact(costs[1:], k)
        include_first = costs[0] + path_exact(costs[2:-1], k - 1)
        return min(exclude_first, include_first)
