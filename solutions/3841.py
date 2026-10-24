from typing import List

class Solution:
    def palindromePath(
        self,
        n: int,
        edges: List[List[int]],
        s: str,
        queries: List[str]
    ) -> List[bool]:

        graph = [[] for _ in range(n)]
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)

        parent = [-1] * n
        depth = [0] * n
        size = [0] * n
        heavy = [-1] * n

        def dfs(u: int, p: int) -> int:
            parent[u] = p
            size[u] = 1

            max_subtree = 0

            for nxt in graph[u]:
                if nxt == p:
                    continue

                depth[nxt] = depth[u] + 1
                dfs(nxt, u)

                size[u] += size[nxt]

                if size[nxt] > max_subtree:
                    max_subtree = size[nxt]
                    heavy[u] = nxt

            return size[u]

        dfs(0, -1)

        head = [0] * n
        pos = [0] * n
        current_pos = 0

        def decompose(u: int, h: int) -> None:
            nonlocal current_pos

            head[u] = h
            pos[u] = current_pos
            current_pos += 1

            if heavy[u] != -1:
                decompose(heavy[u], h)

            for nxt in graph[u]:
                if nxt == parent[u] or nxt == heavy[u]:
                    continue
                decompose(nxt, nxt)

        decompose(0, 0)

        base = [0] * n
        chars = list(s)

        for node in range(n):
            base[pos[node]] = 1 << (ord(chars[node]) - ord("a"))

        seg = [0] * (4 * n)

        def build(idx: int, left: int, right: int) -> None:
            if left == right:
                seg[idx] = base[left]
                return

            mid = (left + right) // 2

            build(idx * 2, left, mid)
            build(idx * 2 + 1, mid + 1, right)

            seg[idx] = seg[idx * 2] ^ seg[idx * 2 + 1]

        def update(
            idx: int,
            left: int,
            right: int,
            target: int,
            value: int
        ) -> None:
            if left == right:
                seg[idx] = value
                return

            mid = (left + right) // 2

            if target <= mid:
                update(idx * 2, left, mid, target, value)
            else:
                update(idx * 2 + 1, mid + 1, right, target, value)

            seg[idx] = seg[idx * 2] ^ seg[idx * 2 + 1]

        def query(
            idx: int,
            left: int,
            right: int,
            ql: int,
            qr: int
        ) -> int:
            if ql <= left and right <= qr:
                return seg[idx]

            if right < ql or qr < left:
                return 0

            mid = (left + right) // 2

            return (
                query(idx * 2, left, mid, ql, qr)
                ^ query(idx * 2 + 1, mid + 1, right, ql, qr)
            )

        build(1, 0, n - 1)

        def path_xor(u: int, v: int) -> int:
            result = 0

            while head[u] != head[v]:
                if depth[head[u]] < depth[head[v]]:
                    u, v = v, u

                result ^= query(
                    1,
                    0,
                    n - 1,
                    pos[head[u]],
                    pos[u]
                )

                u = parent[head[u]]

            if depth[u] > depth[v]:
                u, v = v, u

            result ^= query(
                1,
                0,
                n - 1,
                pos[u],
                pos[v]
            )

            return result

        answer = []

        for operation in queries:
            parts = operation.split()

            if parts[0] == "update":
                node = int(parts[1])
                ch = parts[2]

                chars[node] = ch

                mask = 1 << (ord(ch) - ord("a"))

                update(
                    1,
                    0,
                    n - 1,
                    pos[node],
                    mask
                )

            else:
                u = int(parts[1])
                v = int(parts[2])

                mask = path_xor(u, v)

                answer.append(mask == 0 or (mask & (mask - 1)) == 0)

        return answer
