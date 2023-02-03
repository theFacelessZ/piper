import {pipe, PipeFunction, Piper} from '../src';

const add =
  (n: number): PipeFunction<number, number> =>
  x =>
    x + n;
const numberString = (x: number) => x.toString();

const promisePipe = (x: number): Promise<number> => {
  return new Promise<number>(resolve => setTimeout(() => resolve(x + 100), x));
};

it('should properly use promise pipes', async () => {
  const result = pipe(500)
    .pipe(promisePipe)
    .pipe(add(5))
    .pipe(numberString).value;

  expect(result).toBeInstanceOf(Promise);
  expect(await result).toEqual('605');
});

interface TransformPipe<T = unknown, TResult = unknown> {
  transform(value: T): TResult;
}

class AddPipe implements TransformPipe<number, number> {
  constructor(protected readonly n: number) {}

  transform(value: number): number {
    return value + this.n;
  }
}

class SquarePipe implements TransformPipe<number, number> {
  transform(value: number): number {
    return value * value;
  }
}

class AsyncPipe implements TransformPipe<number, Promise<number>> {
  transform(value: number): Promise<number> {
    return new Promise(resolve => setTimeout(() => resolve(value), 100));
  }
}

it('should support multiple source chain', async () => {
  let container = pipe<unknown>(1);

  // Attempt to mimic a nestjs-like transformation pipe.
  const pipes: TransformPipe[] = [
    new AddPipe(10),
    new AsyncPipe(),
    new SquarePipe(),
    new AddPipe(10),
  ];

  for (const item of pipes) {
    container = container.pipe(x => item.transform(x));
  }

  expect(container.value).toBeInstanceOf(Promise);
  expect(await container.value).toEqual(131);
});

it('should pipeSync with a sync function', () => {
  const piper = new Piper(2);
  const result = piper.pipeSync(val => val * 2);
  expect(result.value).toBe(4);
});

it('should pipe with a sync function', () => {
  const piper = new Piper(2);
  const result = piper.pipe(val => val * 2);
  expect(result.value).toBe(4);
});

it('should pipe with an async function', () => {
  const piper = new Piper(Promise.resolve(2));
  const result = piper.pipe(val => Promise.resolve(val * 2));
  expect(result.value).resolves.toBe(4);
});

it('should return the correct value', () => {
  const piper = new Piper(2);
  expect(piper.value).toBe(2);
});

it('should return the correct valueOf', () => {
  const piper = new Piper(2);
  expect(piper.valueOf()).toBe(2);
});

it('should return the correct toString', () => {
  const piper = new Piper(2);
  expect(piper.toString()).toBe('2');
});

it('should reproduce real world example (jest cli)', () => {
  const value = pipe(
    Object.keys(process.env)
      .map(v => `${v}=${process.env[v]}`)
      .join(' ')
  )
    .pipe(v => `$ ${v}`)
    .pipe(v => (console.log(v), v));

  expect(typeof value.value).toEqual('string');
});
