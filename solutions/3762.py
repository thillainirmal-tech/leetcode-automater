from typing import List


class Solution:
    def minOperations(self, nums: List[int], k: int, queries: List[List[int]]) -> List[int]:
        n = len(nums)
        values = [value // k for value in nums]
        ordered = sorted(set(values))
        rank = {value: index for index, value in enumerate(ordered)}
        left_child = [0]
        right_child = [0]
        counts = [0]
        sums = [0]
        roots = [0]

        def update(previous: int, low: int, high: int, position: int, value: int) -> int:
            node = len(counts)
            left_child.append(left_child[previous])
            right_child.append(right_child[previous])
            counts.append(counts[previous] + 1)
            sums.append(sums[previous] + value)
            if low < high:
                middle = (low + high) // 2
                if position <= middle:
                    left_child[node] = update(left_child[previous], low, middle, position, value)
                else:
                    right_child[node] = update(right_child[previous], middle + 1, high, position, value)
            return node

        for value in values:
            roots.append(update(roots[-1], 0, len(ordered) - 1, rank[value], value))

        residue_changes = [0] * n
        for index in range(1, n):
            residue_changes[index] = residue_changes[index - 1] + (
                nums[index] % k != nums[index - 1] % k
            )

        answers = []
        for left, right in queries:
            if residue_changes[right] != residue_changes[left]:
                answers.append(-1)
                continue
            before, after = roots[left], roots[right + 1]
            length = right - left + 1
            wanted = (length + 1) // 2
            low, high = 0, len(ordered) - 1
            a, b = before, after
            left_count = left_sum = 0
            while low < high:
                middle = (low + high) // 2
                count_in_left = counts[left_child[b]] - counts[left_child[a]]
                if wanted <= count_in_left:
                    a, b = left_child[a], left_child[b]
                    high = middle
                else:
                    left_count += count_in_left
                    left_sum += sums[left_child[b]] - sums[left_child[a]]
                    wanted -= count_in_left
                    a, b = right_child[a], right_child[b]
                    low = middle + 1
            median = ordered[low]
            equal_and_left_count = left_count + counts[b] - counts[a]
            equal_and_left_sum = left_sum + sums[b] - sums[a]
            total_sum = sums[after] - sums[before]
            right_count = length - equal_and_left_count
            right_sum = total_sum - equal_and_left_sum
            answers.append(
                median * equal_and_left_count - equal_and_left_sum
                + right_sum - median * right_count
            )
        return answers
