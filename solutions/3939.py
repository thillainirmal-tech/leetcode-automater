from typing import List
import sys

class Solution:
    def countValidSubsets(self, parent: List[int], nums: List[int], k: int) -> int:
        MOD = 10**9 + 7
        n = len(parent)

        children = [[] for _ in range(n)]
        for i in range(1, n):
            children[parent[i]].append(i)

        sys.setrecursionlimit(10000)

        def dfs(u: int):
            dp0 = [0] * k
            dp1 = [0] * k

            dp0[0] = 1
            dp1[nums[u] % k] = 1

            for v in children[u]:
                child0, child1 = dfs(v)

                next0 = [0] * k
                next1 = [0] * k

                # u not selected
                for r1 in range(k):
                    if dp0[r1] == 0:
                        continue
                    for r2 in range(k):
                        ways = (child0[r2] + child1[r2]) % MOD
                        if ways:
                            next0[(r1 + r2) % k] = (
                                next0[(r1 + r2) % k]
                                + dp0[r1] * ways
                            ) % MOD

                # u selected
                for r1 in range(k):
                    if dp1[r1] == 0:
                        continue
                    for r2 in range(k):
                        if child0[r2]:
                            next1[(r1 + r2) % k] = (
                                next1[(r1 + r2) % k]
                                + dp1[r1] * child0[r2]
                            ) % MOD

                dp0 = next0
                dp1 = next1

            return dp0, dp1

        root0, root1 = dfs(0)

        answer = (root0[0] + root1[0] - 1) % MOD
        return answer
