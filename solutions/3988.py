PATTERNS = [
    [],
    [["."]],
    [["..", ".."]],
    [["..", "..", ".."], ["...", "..."]],
    [["..", "..", "..", ".."], ["....", "...."], [".." + chr(35), "...", chr(35) + ".."]],
]


class Solution(object):
    def createGrid(self, m, n, k):
        wall = chr(35)
        for pattern in PATTERNS[k]:
            if len(pattern) > m or len(pattern[0]) > n:
                continue
            answer = [[wall] * n for _ in range(m)]
            for row in range(len(pattern)):
                for column in range(len(pattern[0])):
                    answer[row][column] = pattern[row][column]
            for row in range(len(pattern), m):
                answer[row][len(pattern[0]) - 1] = "."
            for column in range(len(pattern[0]), n):
                answer[m - 1][column] = "."
            return ["".join(row) for row in answer]
        return []
