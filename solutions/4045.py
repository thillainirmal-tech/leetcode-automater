class Solution(object):
    def countGroups(self, position, speed, distance):
        groups = 0
        slowest = float("inf")
        for index in reversed(range(len(position))):
            already_connected = (
                index + 1 < len(position)
                and position[index + 1] - position[index] <= distance
            )
            if already_connected or speed[index] > slowest:
                continue
            slowest = speed[index]
            groups += 1
        return groups
