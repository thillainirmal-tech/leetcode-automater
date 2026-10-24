from collections import deque
from typing import List

class Solution:
    def minPartitionScore(self, nums: List[int], k: int) -> int:
        n = len(nums)

        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + nums[i]

        INF = 10**30

        dp_prev = [INF] * (n + 1)
        dp_prev[0] = 0

        class Line:
            __slots__ = ("m", "b")

            def __init__(self, m: int, b: int):
                self.m = m
                self.b = b

            def value(self, x: int) -> int:
                return self.m * x + self.b

        def bad(l1: Line, l2: Line, l3: Line) -> bool:
            return (
                (l3.b - l1.b) * (l1.m - l2.m)
                <= (l2.b - l1.b) * (l1.m - l3.m)
            )

        for t in range(1, k + 1):
            dp_cur = [INF] * (n + 1)
            hull = deque()

            j = t - 1
            if dp_prev[j] < INF:
                b = dp_prev[j] + (prefix[j] * prefix[j] - prefix[j]) // 2
                hull.append(Line(-prefix[j], b))

            for i in range(t, n + 1):
                x = prefix[i]

                while (
                    len(hull) >= 2
                    and hull[0].value(x) >= hull[1].value(x)
                ):
                    hull.popleft()

                best = hull[0].value(x)
                a = (x * x + x) // 2
                dp_cur[i] = a + best

                if dp_prev[i] < INF:
                    new_line = Line(
                        -prefix[i],
                        dp_prev[i]
                        + (prefix[i] * prefix[i] - prefix[i]) // 2,
                    )

                    while (
                        len(hull) >= 2
                        and bad(hull[-2], hull[-1], new_line)
                    ):
                        hull.pop()

                    hull.append(new_line)

            dp_prev = dp_cur

        return dp_prev[n]
