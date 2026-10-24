type Fn = (...params: any[]) => Promise<any>;

function timeLimit(fn: Fn, t: number): Fn {
  return function (...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject("Time Limit Exceeded"), t);
      fn(...args).then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });
  };
}
