from typing import List

class Fenwick:
    def __init__(self, n: int):
        self.n = n
        self.bit = [0] * (n + 1)

    def add(self, idx: int, delta: int) -> None:
        while idx <= self.n:
            self.bit[idx] += delta
            idx += idx & -idx

    def query(self, idx: int) -> int:
        res = 0
        while idx > 0:
            res += self.bit[idx]
            idx -= idx & -idx
        return res

    def range_query(self, left: int, right: int) -> int:
        if left > right:
            return 0
        return self.query(right) - self.query(left - 1)

class Solution:
    def minInversionCount(self, nums: List[int], k: int) -> int:
        n = len(nums)

        values = sorted(set(nums))
        rank = {v: i + 1 for i, v in enumerate(values)}
        compressed = [rank[x] for x in nums]

        m = len(values)

        build_bit = Fenwick(m)
        inversions = 0

        for i in range(k):
            x = compressed[i]
            inversions += i - build_bit.query(x)
            build_bit.add(x, 1)

        answer = inversions

        window_bit = Fenwick(m)
        for i in range(k):
            window_bit.add(compressed[i], 1)

        for left in range(n - k):
            outgoing = compressed[left]

            removed_pairs = window_bit.query(outgoing - 1)
            inversions -= removed_pairs

            window_bit.add(outgoing, -1)

            incoming = compressed[left + k]

            window_size = k - 1
            greater_count = (
                window_size - window_bit.query(incoming)
            )

            inversions += greater_count

            window_bit.add(incoming, 1)

            answer = min(answer, inversions)

        return answer
