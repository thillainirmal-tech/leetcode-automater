from bisect import bisect_left
from typing import List


class Solution:
    def totalScore(self, hp: int, damage: List[int], requirement: List[int]) -> int:
        prefix = [0]
        for value in damage:
            prefix.append(prefix[-1] + value)

        answer = 0
        for room, needed_hp in enumerate(requirement, 1):
            threshold = prefix[room] + needed_hp - hp
            earliest = bisect_left(prefix, threshold, 0, room)
            answer += room - earliest
        return answer
