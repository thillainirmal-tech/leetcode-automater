import java.util.*;

class SQL {
    private final Map<String, Integer> columns = new HashMap<>();
    private final Map<String, Map<Integer, List<String>>> rows = new HashMap<>();
    private final Map<String, Integer> nextId = new HashMap<>();

    public SQL(List<String> names, List<Integer> columnCounts) {
        for (int i = 0; i < names.size(); ++i) {
            columns.put(names.get(i), columnCounts.get(i));
            rows.put(names.get(i), new HashMap<>());
            nextId.put(names.get(i), 1);
        }
    }

    public boolean ins(String name, List<String> row) {
        if (!columns.containsKey(name) || row.size() != columns.get(name)) return false;
        int id = nextId.get(name);
        rows.get(name).put(id, new ArrayList<>(row));
        nextId.put(name, id + 1);
        return true;
    }

    public void rmv(String name, int rowId) {
        Map<Integer, List<String>> table = rows.get(name);
        if (table != null) table.remove(rowId);
    }

    public String sel(String name, int rowId, int columnId) {
        Map<Integer, List<String>> table = rows.get(name);
        if (table == null || !table.containsKey(rowId)) return "<null>";
        List<String> row = table.get(rowId);
        if (columnId < 1 || columnId > row.size()) return "<null>";
        return row.get(columnId - 1);
    }

    public List<String> exp(String name) {
        Map<Integer, List<String>> table = rows.get(name);
        if (table == null) return new ArrayList<>();
        List<Integer> ids = new ArrayList<>(table.keySet());
        Collections.sort(ids);
        List<String> result = new ArrayList<>();
        for (int id : ids) result.add(id + "," + String.join(",", table.get(id)));
        return result;
    }
}
