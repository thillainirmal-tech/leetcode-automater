from collections import deque
from typing import List

class Solution:
    def minimumThreshold(
        self,
        n: int,
        edges: List[List[int]],
        source: int,
        target: int,
        k: int
    ) -> int:

        if source == target:
            return 0

        if not edges:
            return -1

        graph = [[] for _ in range(n)]
        weights = set()

        for u, v, w in edges:
            graph[u].append((v, w))
            graph[v].append((u, w))
            weights.add(w)

        sorted_weights = [0] + sorted(weights)

        def can(threshold: int) -> bool:
            INF = float("inf")
            dist = [INF] * n
            dist[source] = 0

            dq = deque([source])

            while dq:
                node = dq.popleft()

                for nei, weight in graph[node]:
                    cost = 0 if weight <= threshold else 1
                    new_dist = dist[node] + cost

                    if new_dist < dist[nei]:
                        dist[nei] = new_dist

                        if cost == 0:
                            dq.appendleft(nei)
                        else:
                            dq.append(nei)

            return dist[target] <= k

        if not can(max(sorted_weights)):
            return -1

        left = 0
        right = len(sorted_weights) - 1
        answer = sorted_weights[right]

        while left <= right:
            mid = (left + right) // 2
            threshold = sorted_weights[mid]

            if can(threshold):
                answer = threshold
                right = mid - 1
            else:
                left = mid + 1

        return answer
