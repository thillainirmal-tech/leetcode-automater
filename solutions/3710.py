from typing import List
from collections import deque

class Solution:
    def maxPartitionFactor(self, points: List[List[int]]) -> int:
        n = len(points)
        if n == 2:
            return 0
        
        # Function to compute Manhattan distance
        def manhattan(p1, p2):
            return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])
        
        # Compute maximum possible Manhattan distance
        max_dist = 0
        for i in range(n):
            for j in range(i+1, n):
                max_dist = max(max_dist, manhattan(points[i], points[j]))
        
        # Check if candidate distance can be a partition factor using bipartite check
        def can_partition(candidate):
            graph = [[] for _ in range(n)]
            for i in range(n):
                for j in range(i+1, n):
                    if manhattan(points[i], points[j]) < candidate:
                        graph[i].append(j)
                        graph[j].append(i)
            
            color = [0] * n
            for i in range(n):
                if color[i] == 0:
                    queue = deque([i])
                    color[i] = 1
                    while queue:
                        node = queue.popleft()
                        for nei in graph[node]:
                            if color[nei] == 0:
                                color[nei] = -color[node]
                                queue.append(nei)
                            elif color[nei] == color[node]:
                                return False
            return True
        
        # Binary search on possible partition factors
        low, high = 0, max_dist
        while low < high:
            mid = (low + high + 1) // 2
            if can_partition(mid):
                low = mid
            else:
                high = mid - 1
        return low
