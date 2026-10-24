import java.util.*;

class Solution {
  public int earliestSecondToMarkIndices(int[] nums, int[] changeIndices) {
    long numsSum = 0;
    for (int num : nums) numsSum += num;
    Map<Integer, Integer> secondToIndex = getSecondToIndex(nums, changeIndices);
    int left = 0;
    int right = changeIndices.length + 1;
    while (left < right) {
      int middle = (left + right) >>> 1;
      if (canMark(nums, secondToIndex, middle, numsSum)) right = middle;
      else left = middle + 1;
    }
    return left <= changeIndices.length ? left : -1;
  }

  private boolean canMark(int[] nums, Map<Integer, Integer> secondToIndex,
                          int maxSecond, long numsSum) {
    PriorityQueue<Integer> savings = new PriorityQueue<>();
    int freeMarkSeconds = 0;
    for (int second = maxSecond - 1; second >= 0; second--) {
      Integer index = secondToIndex.get(second);
      if (index == null) {
        freeMarkSeconds++;
      } else {
        savings.offer(nums[index]);
        if (freeMarkSeconds == 0) {
          savings.poll();
          freeMarkSeconds++;
        } else {
          freeMarkSeconds--;
        }
      }
    }

    long saved = 0;
    for (int value : savings) saved += value;
    int zeroed = savings.size();
    long ordinaryCost = numsSum - saved + nums.length - zeroed;
    long specialCost = 2L * zeroed;
    return ordinaryCost + specialCost <= maxSecond;
  }

  private Map<Integer, Integer> getSecondToIndex(int[] nums, int[] changeIndices) {
    Map<Integer, Integer> firstSecond = new HashMap<>();
    for (int second = 0; second < changeIndices.length; second++) {
      int index = changeIndices[second] - 1;
      if (nums[index] > 0) firstSecond.putIfAbsent(index, second);
    }
    Map<Integer, Integer> result = new HashMap<>();
    for (Map.Entry<Integer, Integer> entry : firstSecond.entrySet())
      result.put(entry.getValue(), entry.getKey());
    return result;
  }
}
