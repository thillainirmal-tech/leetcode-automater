class Solution(object):
    def maxAlternatingSum(self, nums):
        negative = float("-inf")
        answer = negative
        no_deletion = [[negative, negative], [negative, negative]]
        state = [[negative] * 2 for _ in range(2)]
        for value in nums:
            state[1][:] = [
                max(state[1][1] + value, state[0][0]),
                max(state[1][0] - value, state[0][1]),
            ]
            state[0][:] = [max(state[0][1], 0) + value, state[0][0] - value]
            answer = max(answer, max(state[0]), max(state[1]))
        return answer
