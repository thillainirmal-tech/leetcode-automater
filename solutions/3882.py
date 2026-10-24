class Solution:
    def minCost(self, grid):
        rows = len(grid)
        columns = len(grid[0])
        previous = [set() for _ in range(columns)]
        for row in range(rows):
            current = [set() for _ in range(columns)]
            for column in range(columns):
                value = grid[row][column]
                if row == 0 and column == 0:
                    current[column].add(value)
                    continue
                if row:
                    current[column].update(old ^ value for old in previous[column])
                if column:
                    current[column].update(old ^ value for old in current[column - 1])
            previous = current
        return min(previous[-1])
