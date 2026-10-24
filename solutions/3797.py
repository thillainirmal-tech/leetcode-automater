from math import isqrt


class Solution:
    def numberOfRoutes(self, grid, d):
        modulus = 1000000007
        height = len(grid)
        width = len(grid[0])
        vertical_reach = isqrt(d * d - 1)
        ways = [int(cell == ".") for cell in grid[-1]]

        def window_sums(values, radius, available):
            cumulative = [0]
            for value in values:
                cumulative.append((cumulative[-1] + value) % modulus)
            result = [0] * width
            for column in range(width):
                if available[column] == ".":
                    low = max(0, column - radius)
                    high = min(width, column + radius + 1)
                    result[column] = (cumulative[high] - cumulative[low]) % modulus
            return result

        for row in range(height - 1, -1, -1):
            departures = window_sums(ways, d, grid[row])
            if row == 0:
                return sum(departures) % modulus
            ways = window_sums(departures, vertical_reach, grid[row - 1])
        return 0
