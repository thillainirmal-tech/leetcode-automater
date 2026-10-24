from typing import List
import heapq

class Solution:
    def minCost(self, n: int, prices: List[int], roads: List[List[int]]) -> List[int]:
        from collections import defaultdict

        def dijkstra(start: int, graph: List[List[List[int]]]) -> List[int]:
            dist = [float('inf')] * n
            dist[start] = 0
            heap = [(0, start)]
            while heap:
                d, u = heapq.heappop(heap)
                if d > dist[u]:
                    continue
                for v, w in graph[u]:
                    if dist[v] > d + w:
                        dist[v] = d + w
                        heapq.heappush(heap, (dist[v], v))
            return dist

        # Build graphs
        graph_empty = [[] for _ in range(n)]
        graph_with = [[] for _ in range(n)]
        for u, v, cost, taxi in roads:
            graph_empty[u].append((v, cost))
            graph_empty[v].append((u, cost))
            graph_with[u].append((v, cost * taxi))
            graph_with[v].append((u, cost * taxi))

        ans = [0] * n
        for i in range(n):
            dist_empty = dijkstra(i, graph_empty)
            dist_with = dijkstra(i, graph_with)
            min_cost = prices[i]
            for j in range(n):
                total = dist_empty[j] + dist_with[j] + prices[j]
                if total < min_cost:
                    min_cost = total
            ans[i] = min_cost
        return ans
