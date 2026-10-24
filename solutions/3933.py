from typing import List


class Solution:
    def countLocalMaximums(self, matrix: List[List[int]]) -> int:
        rows, columns = len(matrix), len(matrix[0])
        cells = sorted(
            ((matrix[row][column], row, column) for row in range(rows) for column in range(columns)),
            reverse=True,
        )
        tree = [[0] * (columns + 1) for _ in range(rows + 1)]

        def add(row: int, column: int) -> None:
            i = row + 1
            while i <= rows:
                j = column + 1
                while j <= columns:
                    tree[i][j] += 1
                    j += j & -j
                i += i & -i

        def prefix(row: int, column: int) -> int:
            result = 0
            i = row
            while i > 0:
                j = column
                while j > 0:
                    result += tree[i][j]
                    j -= j & -j
                i -= i & -i
            return result

        def rectangle(top: int, left: int, bottom: int, right: int) -> int:
            return (
                prefix(bottom + 1, right + 1)
                - prefix(top, right + 1)
                - prefix(bottom + 1, left)
                + prefix(top, left)
            )

        answer = 0
        index = 0
        while index < len(cells):
            value = cells[index][0]
            end = index
            while end < len(cells) and cells[end][0] == value:
                end += 1
            if value:
                for _, row, column in cells[index:end]:
                    top, bottom = max(0, row - value), min(rows - 1, row + value)
                    left, right = max(0, column - value), min(columns - 1, column + value)
                    greater = rectangle(top, left, bottom, right)
                    for corner_row in (row - value, row + value):
                        for corner_column in (column - value, column + value):
                            if 0 <= corner_row < rows and 0 <= corner_column < columns:
                                if matrix[corner_row][corner_column] > value:
                                    greater -= 1
                    if greater == 0:
                        answer += 1
            for _, row, column in cells[index:end]:
                add(row, column)
            index = end
        return answer
