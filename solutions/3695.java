import java.util.*;

class Solution {
    private int[] parent;
    private int[] size;

    public long maxAlternatingSum(int[] nums, int[][] swaps) {
        int n = nums.length;
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; ++i) {
            parent[i] = i;
            size[i] = 1;
        }
        for (int[] edge : swaps) union(edge[0], edge[1]);

        Map<Integer, List<Integer>> values = new HashMap<>();
        Map<Integer, Integer> evenSlots = new HashMap<>();
        for (int i = 0; i < n; ++i) {
            int root = find(i);
            values.computeIfAbsent(root, ignored -> new ArrayList<>()).add(nums[i]);
            if ((i & 1) == 0) evenSlots.merge(root, 1, Integer::sum);
        }

        long answer = 0;
        for (Map.Entry<Integer, List<Integer>> entry : values.entrySet()) {
            List<Integer> component = entry.getValue();
            Collections.sort(component);
            int positive = evenSlots.getOrDefault(entry.getKey(), 0);
            int split = component.size() - positive;
            for (int i = 0; i < component.size(); ++i) {
                answer += i < split ? -component.get(i) : component.get(i);
            }
        }
        return answer;
    }

    private int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    private void union(int a, int b) {
        int rootA = find(a), rootB = find(b);
        if (rootA == rootB) return;
        if (size[rootA] < size[rootB]) {
            int temp = rootA;
            rootA = rootB;
            rootB = temp;
        }
        parent[rootB] = rootA;
        size[rootA] += size[rootB];
    }
}
