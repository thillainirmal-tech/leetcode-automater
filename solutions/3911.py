from bisect import bisect_left, bisect_right
from typing import List


class Solution:
    def kthRemainingInteger(self, nums: List[int], queries: List[List[int]]) -> List[int]:
        positions = []
        ranks = []
        for index, value in enumerate(nums):
            if value % 2 == 0:
                positions.append(index)
                ranks.append(value // 2)

        answer = []
        for left, right, k in queries:
            start = bisect_left(positions, left)
            end = bisect_right(positions, right)
            low, high = k, k + end - start
            while low < high:
                middle = (low + high) // 2
                removed = bisect_right(ranks, middle, start, end) - start
                if middle - removed >= k:
                    high = middle
                else:
                    low = middle + 1
            answer.append(low * 2)
        return answer
