type Listener = (message: string) => void;

let listener: Listener | null = null;

export const toast = {
  show(message: string) {
    listener?.(message);
  },
  _subscribe(fn: Listener) {
    listener = fn;
    return () => { listener = null; };
  },
};
