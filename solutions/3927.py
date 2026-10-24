from typing import List


class Solution:
    def minArraySum(self, nums: List[int]) -> int:
        maximum = max(nums)
        frequency = [0] * (maximum + 1)
        for value in nums:
            frequency[value] += 1

        answer = 0
        for divisor in range(1, maximum + 1):
            if frequency[divisor] == 0:
                continue
            for multiple in range(divisor, maximum + 1, divisor):
                if frequency[multiple]:
                    answer += frequency[multiple] * divisor
                    frequency[multiple] = 0
        return answer
