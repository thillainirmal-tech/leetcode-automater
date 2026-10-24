from collections import Counter
from typing import List


class Solution:
    def minSwaps(self, nums: List[int], forbidden: List[int]) -> int:
        n = len(nums)
        combined = Counter(nums)
        combined.update(forbidden)
        if any(count > n for count in combined.values()):
            return -1

        bad = Counter(
            value for value, blocked in zip(nums, forbidden) if value == blocked
        )
        total_bad = sum(bad.values())
        largest_group = max(bad.values(), default=0)
        return max((total_bad + 1) // 2, largest_group)
