export class TokenStream {
   readonly sequence: IterableIterator<string>;
   protected current: string;
   protected next: string;
   constructor(line: string) {
      this.sequence = createTokenLoop(line);
   }

   step(): string {
      if (this.next) [this.current, this.next] = [this.next, null];
      else {
         const { value, done } = this.sequence.next();
         if (done) {
            throw new RangeError('There are no more steps');
         }
         this.current = value;
      }
      return this.current;
   }

   look(): string {
      if (this.current) {
         return this.current;
      }
      throw new RangeError("There's nothing to look at");
   }

   peek(): string {
      if (this.next) {
         return this.next;
      }
      const { value, done } = this.sequence.next();
      if (done) {
         throw new RangeError("There's nothing to peek at");
      }
      return (this.next = value);
   }

   anymore(): boolean {
      if (this.next) {
         return true;
      }
      const { value, done } = this.sequence.next();
      if (done) {
         return false;
      }
      this.next = value;
      return true;
   }

   nomore(): boolean {
      return !this.anymore();
   }

   close(): void {
      this.sequence.return();
   }
}

function* createTokenLoop(line: string): Generator<string> {
   let index = 0;
   while ((line = line.trimLeft()) != '') {
      if (-1 == (index = line.indexOf(' '))) {
         index = line.length;
      }
      yield line.slice(0, index);
      line = line.slice(index);
   }
}
