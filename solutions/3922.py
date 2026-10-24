class Solution:
    def minFlips(self, s: str) -> int:
        if len(s) <= 2:
            return 0
        ones = s.count("1")
        zeros = len(s) - ones
        at_most_one_one = max(0, ones - 1)
        endpoint_ones = (s[0] != "1") + (s[-1] != "1")
        endpoint_ones += ones - (s[0] == "1") - (s[-1] == "1")
        return min(at_most_one_one, zeros, endpoint_ones)
