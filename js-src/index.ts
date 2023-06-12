import path from 'node:path';
import Piscina from 'piscina';
import { read } from './bindings';

type WorkerOptions = ConstructorParameters<typeof Piscina>[0];

export type C2paOptions = {
  workerOptions: WorkerOptions;
};

const defaultOptions: C2paOptions = {
  workerOptions: {
    idleTimeout: 60000, // 1 minute
  },
};

export type C2pa = ReturnType<typeof createC2pa>;

export function createC2pa(options?: C2paOptions) {
  const opts = Object.assign({}, defaultOptions, options);
  const piscina = new Piscina({
    ...opts.workerOptions,
    filename: process.env.BINDINGS_PATH ?? path.join(__dirname, 'bindings.js'),
  });

  return {
    async read(args: Parameters<typeof read>[0]) {
      return piscina.run(args, {
        name: 'read',
        transferList: [args.buffer.buffer],
      });
    },

    async destroy() {
      return piscina.destroy();
    },

    get workerPool() {
      return piscina;
    },
  };
}
