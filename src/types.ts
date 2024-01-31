type HashData = {
   key: string;
   value: Buffer;
};

interface List<T> {
   length: number;
   prepend(item: T): void;
   append(item: T): void;
   popR(): T | undefined;
   popL(): T | undefined;
   slice(start_idx: number, end_idx: number): void;
}

interface Hash {
   hset(key: string, value: Buffer): void;
   hget(key: string): Buffer | null;
   hdel(key: string, hkeys: string[]): number;
}

type StoreData = Map<string, Buffer | Hash | List<Buffer>>;

interface Storer {
   hset(key: string, entries: HashData[]): void;
   hget(key: string, hkey: string): Buffer | null;
   hdel(key: string, hkeys: string[]): number;
   set(key: string, value: Buffer): void;
   get(key: string): Buffer | null;
   append(key: string, elements: Buffer[]): number;
   prepend(key: string, elements: Buffer[]): number;
   popL(key: string, count: number): Buffer[] | null;
   popR(key: string, count: number): Buffer[] | null;
   del(keys: string[]): number;
   expire(key: string, seconds: number): void;
}

export { HashData, Storer, StoreData, Hash, List};
