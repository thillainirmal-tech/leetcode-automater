from collections import defaultdict
from random import getrandbits


class Solution(object):
    def validSubarrays(self, nums, k, queries):
        def minimum_left(distinct):
            result = [len(nums)] * len(nums)
            frequency = defaultdict(int)
            left = 0
            for right in range(len(nums)):
                frequency[nums[right]] += 1
                while len(frequency) == distinct + 1:
                    frequency[nums[left]] -= 1
                    if frequency[nums[left]] == 0:
                        del frequency[nums[left]]
                    left += 1
                if len(frequency) == distinct:
                    result[right] = left
            return result

        low = minimum_left(k)
        high = minimum_left(k - 1)
        hashes = {}
        prefix = [0] * (len(nums) + 1)
        for index, value in enumerate(nums):
            if value not in hashes:
                hashes[value] = getrandbits(64)
            prefix[index + 1] = prefix[index] ^ hashes[value]
        return [
            (right - left + 1) % 2 == 0
            and prefix[right + 1] ^ prefix[left] == 0
            and low[right] <= left < high[right]
            for left, right in queries
        ]
