import java.util.*;

class Solution {
  public long maximumValueSum(int[][] board) {
    int rows = board.length;
    List<int[]>[] prefix = new List[rows];
    List<int[]>[] suffix = new List[rows];
    List<int[]> best = new ArrayList<>();
    for (int row = 0; row < rows; row++) {
      prefix[row] = new ArrayList<>(best);
      addRow(best, board[row]);
    }
    best.clear();
    for (int row = rows - 1; row >= 0; row--) {
      suffix[row] = new ArrayList<>(best);
      addRow(best, board[row]);
    }

    long answer = Long.MIN_VALUE;
    for (int row = 1; row + 1 < rows; row++) {
      for (int col = 0; col < board[row].length; col++) {
        for (int[] before : prefix[row]) {
          if (before[1] == col) continue;
          for (int[] after : suffix[row]) {
            if (after[1] == col || after[1] == before[1]) continue;
            answer = Math.max(answer, (long) before[0] + board[row][col] + after[0]);
          }
        }
      }
    }
    return answer;
  }

  private void addRow(List<int[]> best, int[] row) {
    for (int col = 0; col < row.length; col++) {
      int existing = -1;
      for (int i = 0; i < best.size(); i++)
        if (best.get(i)[1] == col) existing = i;
      if (existing >= 0 && best.get(existing)[0] >= row[col]) continue;
      if (existing >= 0) best.remove(existing);
      best.add(new int[] {row[col], col});
    }
    best.sort((a, b) -> Integer.compare(b[0], a[0]));
    while (best.size() > 3) best.remove(best.size() - 1);
  }
}
