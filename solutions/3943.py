from collections import Counter
from typing import List


class Solution:
    def numberOfPairs(
        self, nums1: List[int], nums2: List[int], queries: List[List[int]]
    ) -> List[int]:
        block_size = 450
        n = len(nums2)
        block_count = (n + block_size - 1) // block_size
        lazy = [0] * block_count
        frequencies = [Counter() for _ in range(block_count)]

        def rebuild(block: int) -> None:
            start = block * block_size
            end = min(n, start + block_size)
            frequencies[block] = Counter(nums2[start:end])

        for block in range(block_count):
            rebuild(block)

        def add_range(left: int, right: int, value: int) -> None:
            first, last = left // block_size, right // block_size
            if first == last:
                for index in range(left, right + 1):
                    nums2[index] += value
                rebuild(first)
                return
            first_end = (first + 1) * block_size
            for index in range(left, first_end):
                nums2[index] += value
            rebuild(first)
            last_start = last * block_size
            for index in range(last_start, right + 1):
                nums2[index] += value
            rebuild(last)
            for block in range(first + 1, last):
                lazy[block] += value

        def frequency(value: int) -> int:
            return sum(
                frequencies[block].get(value - lazy[block], 0)
                for block in range(block_count)
            )

        nums1_frequency = Counter(nums1)
        answer = []
        for query in queries:
            if query[0] == 1:
                add_range(query[1], query[2], query[3])
            else:
                total = query[1]
                answer.append(
                    sum(count * frequency(total - value) for value, count in nums1_frequency.items())
                )
        return answer
