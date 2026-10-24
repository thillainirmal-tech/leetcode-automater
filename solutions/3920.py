from typing import List


class Solution:
    def maxFixedPoints(self, nums: List[int]) -> int:
        points = sorted((value, index - value) for index, value in enumerate(nums) if value <= index)
        if not points:
            return 0
        coordinates = sorted({difference for _, difference in points})
        coordinate = {value: index + 1 for index, value in enumerate(coordinates)}
        tree = [0] * (len(coordinates) + 1)

        def query(index: int) -> int:
            result = 0
            while index:
                result = max(result, tree[index])
                index -= index & -index
            return result

        def update(index: int, value: int) -> None:
            while index < len(tree):
                tree[index] = max(tree[index], value)
                index += index & -index

        start = 0
        while start < len(points):
            end = start
            pending = []
            while end < len(points) and points[end][0] == points[start][0]:
                position = coordinate[points[end][1]]
                pending.append((position, query(position) + 1))
                end += 1
            for position, value in pending:
                update(position, value)
            start = end
        return query(len(coordinates))
