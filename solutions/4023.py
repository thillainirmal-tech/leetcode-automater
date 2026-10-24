class Solution(object):
    def elevatorRequests(self, n, start, requests):
        infinity = float("inf")
        if start not in requests:
            requests.append(start)
        requests.sort()
        origin = requests.index(start)
        size = len(requests)
        state = [[infinity] * size for _ in range(2)]
        state[0][origin] = state[1][origin] = 0
        for covered in range(1, size):
            updated = [[infinity] * size for _ in range(2)]
            for left in range(max(origin - covered + 1, 0), min(size - covered, origin) + 1):
                right = left + covered - 1
                remaining = size - covered
                if left:
                    updated[0][left - 1] = min(
                        state[0][left] + (requests[left] - requests[left - 1]) * remaining,
                        state[1][left] + (requests[right] - requests[left - 1]) * remaining,
                    )
                if right + 1 < size:
                    updated[1][left] = min(
                        state[0][left] + (requests[right + 1] - requests[left]) * remaining,
                        state[1][left] + (requests[right + 1] - requests[right]) * remaining,
                    )
            state = updated
        return min(state[0][0], state[1][0])
