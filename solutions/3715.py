from collections import defaultdict
from typing import List


class Solution:
    def sumOfAncestors(self, n: int, edges: List[List[int]], nums: List[int]) -> int:
        limit = max(nums)
        spf = list(range(limit + 1))
        for p in range(2, int(limit**0.5) + 1):
            if spf[p] == p:
                for multiple in range(p * p, limit + 1, p):
                    if spf[multiple] == multiple:
                        spf[multiple] = p

        def signature(value: int):
            odd = []
            while value > 1:
                prime = spf[value]
                parity = 0
                while value % prime == 0:
                    value //= prime
                    parity ^= 1
                if parity:
                    odd.append(prime)
            return tuple(odd)

        signatures = [signature(value) for value in nums]
        graph = [[] for _ in range(n)]
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)

        answer = 0
        on_path = defaultdict(int)
        stack = [(0, -1, False)]
        while stack:
            node, parent, leaving = stack.pop()
            key = signatures[node]
            if leaving:
                on_path[key] -= 1
                continue
            answer += on_path[key]
            on_path[key] += 1
            stack.append((node, parent, True))
            for neighbor in graph[node]:
                if neighbor != parent:
                    stack.append((neighbor, node, False))
        return answer
