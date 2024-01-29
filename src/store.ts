import { HashData, Storer, StoreData, List, Hash } from './types.js';

type ListNode<T> = {
   next?: ListNode<T>;
   prev?: ListNode<T>;
   index?: number;
   value: T;
};

class msList<T> implements List<T> {
   length: number;
   private head: ListNode<T> | undefined;
   private tail: ListNode<T> | undefined;

   //would be a doubly linked list
   constructor() {
      this.length = 0;
      this.head = this.tail = undefined;
   }

   //adding element to the start
   prepend(item: T): void {
      const node: ListNode<T> = {
         value: item,
      };

      this.length++;

      node.index = this.length - 1;

      if (!this.head) {
         this.head = this.tail = node;
         return;
      }

      node.next = this.head;
      this.head.prev = node;
      this.head = node;
   }

   //adding element to the end
   append(item: T): void {
      const node: ListNode<T> = {
         value: item,
      };

      this.length++;

      node.index = this.length - 1;

      if (!this.tail) {
         this.tail = this.head = node;
         return;
      }

      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
   }

   //removing element from end.
   popR(): T | undefined {
      if (!this.tail) {
         return undefined;
      }

      this.length--;

      if (this.length === 1) {
         this.head = this.tail = undefined;
      }

      const tail = this.tail;
      const prev = this.tail?.prev;
      if (prev) {
         prev.next = undefined;
      }
      this.tail = prev;
      return tail?.value;
   }

   //removing element from front.
   popL(): T | undefined {
      if (!this.head) {
         return undefined;
      }

      this.length--;

      if (this.length === 1) {
         this.head = this.tail = undefined;
      }

      const head = this.head;
      const next = this.head?.next;

      if (next) {
         next.prev = undefined;
      }

      this.head = next;
      return head?.value;
   }

   slice(start_idx: number, end_idx: number) {
      //TODO
   }
}

class msHash implements Hash {
   #store: Map<string, Buffer>;

   constructor() {
      this.#store = new Map();
   }

   hset(key: string, value: Buffer) {
      this.#store.set(key, value);
   }

   hget(key: string): Buffer | null {
      const value = this.#store.get(key);

      if (!value) {
         return null;
      }

      return value;
   }

   hdel(key: string): number {
      const deleted = this.#store.delete(key);

      if (!deleted) {
         return 0;
      }

      return 1;
   }
}

class Store implements Storer {
   #store: StoreData;

   constructor(storage: StoreData) {
      this.#store = storage;
   }

   hset(key: string, entries: HashData[]): void {
      let hash = this.#store.get(key) as msHash;

      if (!hash) {
         hash = new msHash();
         this.#store.set(key, hash);
      }

      for (const entry of entries) {
         hash.hset(entry.key, entry.value);
      }
   }

   hget(key: string, hkey: string): Buffer | null {
      const hash = this.#store.get(key) as msHash;

      if (!hash) {
         return null;
      }

      const value = hash.hget(hkey);
      return value ? value : null;
   }

   hdel(key: string, hkeys: string[]): number {
      const hash = this.#store.get(key) as msHash;

      if (!hash) {
         return 0;
      }

      let del_count = 0;

      for (const hkey of hkeys) {
         del_count += hash.hdel(hkey);
      }

      return del_count;
   }

   //STRING
   set(key: string, value: Buffer) {
      this.#store.set(key, value);
   }

   get(key: string): Buffer | null {
      const value = this.#store.get(key) as Buffer;
      console.log('found value from map:', value);
      return value ? value : null;
   }

   //LIST
   append(key: string, elements: Buffer[]): number {
      let list = this.#store.get(key) as msList<Buffer>;

      if (!list) {
         list = new msList();
         this.#store.set(key, list);
      }

      let add_count = 0;

      for (const value of elements) {
         list.append(value);
         add_count += 1;
      }

      return add_count;
   }

   prepend(key: string, elements: Buffer[]): number {
      let list = this.#store.get(key) as msList<Buffer>;

      if (!list) {
         list = new msList();
         this.#store.set(key, list);
      }

      let add_count = 0;

      for (const value of elements) {
         list.prepend(value);
         add_count++;
      }

      return add_count;
   }

   popL(key: string, count: number): Buffer[] | null {
      let list = this.#store.get(key) as msList<Buffer>;

      if (!list) {
         return null;
      }

      let length = list.length + (list.length - count);

      const buffers: Buffer[] = [];

      for (let i = 0; i < length; i++) {
         const rem_val = list.popL();
         if (rem_val) {
            buffers.push(rem_val);
         }
      }

      return buffers.length > 0 ? buffers : null;
   }

   popR(key: string, count: number): Buffer[] | null {
      let list = this.#store.get(key) as msList<Buffer>;

      if (!list) {
         return null;
      }

      let length = list.length + (list.length - count);

      const buffers: Buffer[] = [];

      for (let i = 0; i < length; i++) {
         const rem_val = list.popR();
         if (rem_val) {
            buffers.push(rem_val);
         }
      }

      return buffers.length > 0 ? buffers : null;
   }

   del(keys: string[]): number {
      let del_count = 0;
      for (const key of keys) {
         this.#store.delete(key);
         del_count++;
      }

      return del_count;
   }

   show() {
      console.log('Store:', this.#store);
   }
}

export default Store;
