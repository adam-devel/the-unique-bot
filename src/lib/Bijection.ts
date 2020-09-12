// ! this is too bloated, i dont think i need this
// ? Should optimized the data structure
export class Bijection<K, V> extends Map<K, V> {
   private map: Map<V, K>;
   set(key: K, value: V) {
      super.set(key, value);
      if (!this.map) {
         this.map = new Map();
      }
      this.map.set(value, key);
      return this;
   }
   getKeyByValue(value: V) {
      return this.map.get(value);
   }
   delete(key: K): boolean {
      if (!super.has(key)) return true;
      const d1 = this.map.delete(super.get(key)!);
      const d2 = super.delete(key);
      return d1 && d2;
   }
   deleteEntryByValue(val: V) {
      return this.delete(this.getKeyByValue(val)!) && this.map.delete(val);
   }
   hasValue(val: V) {
      return this.map.has(val);
   }
   some(cb: (key: K, val: V) => boolean) {
      let done = false;
      for (const entry of this) {
         if ((done = cb(...entry))) break;
      }
      return done;
   }
   match(cb: (key: K, val: V) => boolean): { found: boolean; key: K; value: V } {
      let found = false;
      let key: K, value: V;
      for (let entry of this) {
         [key, value] = entry;
         if ((found = cb(key, value))) break;
      }
      return { found, key, value };
   }
}
