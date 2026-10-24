import java.util.*;

class SORTracker {
  private static class Location {
    final String name;
    final int score;

    Location(String name, int score) {
      this.name = name;
      this.score = score;
    }
  }

  private final PriorityQueue<Location> selected = new PriorityQueue<>((a, b) ->
      a.score != b.score ? Integer.compare(a.score, b.score) : b.name.compareTo(a.name));
  private final PriorityQueue<Location> remaining = new PriorityQueue<>((a, b) ->
      a.score != b.score ? Integer.compare(b.score, a.score) : a.name.compareTo(b.name));

  public SORTracker() {}

  public void add(String name, int score) {
    Location location = new Location(name, score);
    if (!selected.isEmpty() && better(location, selected.peek())) {
      remaining.offer(selected.poll());
      selected.offer(location);
    } else {
      remaining.offer(location);
    }
  }

  public String get() {
    selected.offer(remaining.poll());
    return selected.peek().name;
  }

  private boolean better(Location a, Location b) {
    return a.score > b.score || a.score == b.score && a.name.compareTo(b.name) < 0;
  }
}
