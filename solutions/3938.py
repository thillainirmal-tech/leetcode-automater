class Solution:
    def maxScore(self, grid):
        rows = len(grid)
        columns = len(grid[0])
        answer = -(1 << 60)
        for row in range(1, rows - 1):
            for column in range(1, columns - 1):
                answer = max(answer, grid[row][column])
        for line in grid:
            running = line[0]
            for value in line[1:]:
                answer = max(answer, running + value)
                running = max(value, running + value)
        for column in range(columns):
            running = grid[0][column]
            for row in range(1, rows):
                value = grid[row][column]
                answer = max(answer, running + value)
                running = max(value, running + value)
        return answer
