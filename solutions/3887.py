from typing import List

class Solution:
    def numberOfEdgesAdded(self, n: int, edges: List[List[int]]) -> int:
        parent = list(range(n))
        parity = [0] * n  # parity from node to root

        def find(u: int) -> int:
            if parent[u] != u:
                orig = parent[u]
                parent[u] = find(parent[u])
                parity[u] ^= parity[orig]
            return parent[u]

        def union(u: int, v: int, w: int) -> bool:
            ru, rv = find(u), find(v)
            if ru != rv:
                parent[ru] = rv
                parity[ru] = parity[u] ^ parity[v] ^ w
                return True
            # u and v already connected, check cycle parity
            if (parity[u] ^ parity[v] ^ w) == 0:
                return True
            return False

        count = 0
        for u, v, w in edges:
            if union(u, v, w):
                count += 1
        return count
