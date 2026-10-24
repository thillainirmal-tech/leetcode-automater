from typing import List

class Solution:
    def lexSmallestNegatedPerm(self, n: int, target: int) -> List[int]:
        total = n * (n + 1) // 2
        diff = total - target

        if diff < 0 or diff % 2 != 0:
            return []

        need = diff // 2
        if diff // 2 > total:
            return []

        ans = []

        for v in range(n, 0, -1):
            remain_max = (v - 1) * v // 2

            if need >= v and need - v <= remain_max:
                ans.append(-v)
                need -= v
            else:
                ans.append(v)

        return sorted(ans)
