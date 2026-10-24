from typing import List, Tuple
from math import inf

class Solution:
    def minGenerations(self, points: List[List[int]], target: List[int]) -> int:
        target_t = tuple(target)

        dist = {}

        for p in points:
            dist[tuple(p)] = 0

        if target_t in dist:
            return 0

        changed = True

        while changed:
            changed = False

            current_points = list(dist.items())

            n = len(current_points)

            for i in range(n):
                p1, g1 = current_points[i]

                for j in range(i + 1, n):
                    p2, g2 = current_points[j]

                    if p1 == p2:
                        continue

                    mid = (
                        (p1[0] + p2[0]) // 2,
                        (p1[1] + p2[1]) // 2,
                        (p1[2] + p2[2]) // 2,
                    )

                    candidate = max(g1, g2) + 1

                    if candidate < dist.get(mid, inf):
                        dist[mid] = candidate
                        changed = True

        return dist.get(target_t, -1)
