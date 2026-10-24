import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

class Solution {
  public long maxRectangleArea(int[] xCoord, int[] yCoord) {
    int n = xCoord.length;
    if (n < 4) return -1;

    long[] points = new long[n];
    for (int i = 0; i < n; i++)
      points[i] = ((long) xCoord[i] << 32) | (yCoord[i] & 0xffffffffL);
    Arrays.sort(points);

    int[] sortedY = yCoord.clone();
    Arrays.sort(sortedY);
    int unique = 0;
    for (int y : sortedY)
      if (unique == 0 || sortedY[unique - 1] != y) sortedY[unique++] = y;
    sortedY = Arrays.copyOf(sortedY, unique);

    SegmentTree latestX = new SegmentTree(unique);
    Map<Integer, Integer> previousX = new HashMap<>();
    long answer = -1;
    int previousPointX = (int) (points[0] >>> 32);
    int previousPointY = (int) points[0];

    for (int i = 1; i < n; i++) {
      int x = (int) (points[i] >>> 32);
      int y = (int) points[i];
      Integer leftBottomX = previousX.get(previousPointY);
      Integer leftTopX = previousX.get(y);
      if (leftBottomX != null && leftTopX != null &&
          previousPointX == x && leftBottomX.equals(leftTopX)) {
        int low = Arrays.binarySearch(sortedY, previousPointY);
        int high = Arrays.binarySearch(sortedY, y);
        if (leftTopX > latestX.query(low + 1, high - 1)) {
          long area = (long) (x - leftTopX) * (y - previousPointY);
          answer = Math.max(answer, area);
        }
      }

      previousX.put(previousPointY, previousPointX);
      latestX.update(Arrays.binarySearch(sortedY, previousPointY), previousPointX);
      previousPointX = x;
      previousPointY = y;
    }
    return answer;
  }

  private static class SegmentTree {
    private final int size;
    private final int[] tree;

    SegmentTree(int size) {
      this.size = size;
      this.tree = new int[size * 4];
      Arrays.fill(tree, -1);
    }

    void update(int index, int value) {
      update(1, 0, size - 1, index, value);
    }

    int query(int left, int right) {
      if (left > right) return -1;
      return query(1, 0, size - 1, left, right);
    }

    private void update(int node, int low, int high, int index, int value) {
      if (low == high) {
        tree[node] = value;
        return;
      }
      int middle = (low + high) >>> 1;
      if (index <= middle) update(node * 2, low, middle, index, value);
      else update(node * 2 + 1, middle + 1, high, index, value);
      tree[node] = Math.max(tree[node * 2], tree[node * 2 + 1]);
    }

    private int query(int node, int low, int high, int left, int right) {
      if (left <= low && high <= right) return tree[node];
      if (right < low || high < left) return -1;
      int middle = (low + high) >>> 1;
      return Math.max(query(node * 2, low, middle, left, right),
                      query(node * 2 + 1, middle + 1, high, left, right));
    }
  }
}
