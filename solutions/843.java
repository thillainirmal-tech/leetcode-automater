import java.util.*;

class Solution {
  public void findSecretWord(String[] words, Master master) {
    List<String> candidates = new ArrayList<>(Arrays.asList(words));
    while (!candidates.isEmpty()) {
      String guess = chooseGuess(candidates);
      int matches = master.guess(guess);
      if (matches == 6) return;

      List<String> next = new ArrayList<>();
      for (String word : candidates)
        if (matches(guess, word) == matches) next.add(word);
      candidates = next;
    }
  }

  private String chooseGuess(List<String> candidates) {
    String best = candidates.get(0);
    int bestWorstGroup = Integer.MAX_VALUE;
    for (String candidate : candidates) {
      int[] groups = new int[7];
      for (String word : candidates) groups[matches(candidate, word)]++;
      int worstGroup = 0;
      for (int count : groups) worstGroup = Math.max(worstGroup, count);
      if (worstGroup < bestWorstGroup) {
        bestWorstGroup = worstGroup;
        best = candidate;
      }
    }
    return best;
  }

  private int matches(String a, String b) {
    int result = 0;
    for (int i = 0; i < 6; i++)
      if (a.charAt(i) == b.charAt(i)) result++;
    return result;
  }
}
