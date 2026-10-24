class Solution(object):
    def maxValue(self, nums):
        prefix = 0
        minimum = 0
        best = [float("-inf"), 0]
        for index, value in enumerate(nums):
            prefix += value if index % 2 == 0 else -value
            minimum = min(minimum, prefix - best[index % 2])
            best[index % 2] = max(best[index % 2], prefix)
        return prefix - 2 * minimum
