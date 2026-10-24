from typing import List


class Solution:
    def countEffective(self, nums: List[int]) -> int:
        mod = 1_000_000_007
        total_or = 0
        for value in nums:
            total_or |= value
        bits = [bit for bit in range(20) if total_or >> bit & 1]
        size = 1 << len(bits)
        counts = [0] * size
        for value in nums:
            mask = 0
            for compact, bit in enumerate(bits):
                if value >> bit & 1:
                    mask |= 1 << compact
            counts[mask] += 1

        for bit in range(len(bits)):
            step = 1 << bit
            for mask in range(size):
                if mask & step:
                    counts[mask] += counts[mask ^ step]

        powers = [1] * (len(nums) + 1)
        for i in range(1, len(powers)):
            powers[i] = powers[i - 1] * 2 % mod

        answer = 0
        full_bits = len(bits)
        for mask in range(size - 1):
            term = powers[counts[mask]]
            if (full_bits - mask.bit_count() - 1) & 1:
                answer -= term
            else:
                answer += term
        return answer % mod
