import java.util.concurrent.Semaphore;
import java.util.concurrent.locks.ReentrantLock;

class DiningPhilosophers {
  private final Semaphore seats = new Semaphore(4, true);
  private final ReentrantLock[] forks = new ReentrantLock[5];

  public DiningPhilosophers() {
    for (int i = 0; i < forks.length; i++) forks[i] = new ReentrantLock(true);
  }

  public void wantsToEat(int philosopher,
                         Runnable pickLeftFork,
                         Runnable pickRightFork,
                         Runnable eat,
                         Runnable putLeftFork,
                         Runnable putRightFork) throws InterruptedException {
    int left = philosopher;
    int right = (philosopher + 1) % 5;
    seats.acquire();
    forks[left].lock();
    forks[right].lock();
    try {
      pickLeftFork.run();
      pickRightFork.run();
      eat.run();
      putLeftFork.run();
      putRightFork.run();
    } finally {
      forks[right].unlock();
      forks[left].unlock();
      seats.release();
    }
  }
}
