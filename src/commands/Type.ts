/* abstract class Type {
   protected abstract raw: String;
   abstract id: string;
   represent() {
      return `<${this.id}>`;
   }
   abstract parse(data: any): Promise<Type>;
   abstract toString(): String;
   abstract isequal(data: Type): boolean;
   abstract isValid(input: any): boolean;
}

// Primitives
export class Keyword extends Type {
   id = 'keyword';
   raw: string;
   toString() {
      return this.raw;
   }
   async parse(data: string) {
      this.raw = data;
      return this;
   }
   isequal(type: Type) {
      return this.toString() === type.toString();
   }
   isValid(value: string) {
      return /^\w+$/.test(value);
   }
}

export class Text extends Type {
   typeValue: string;
   constructor(data?: string) {
      super(data);
      this.typeId = "string";
   }
   static isValid(value: string) {
      return /^\w+$/.test(value);
   }
}

export class Number extends Type {
   typeValue: string;
   constructor(data?: string) {
      super(data);
      this.typeId = "integer";
   }
   parse(input: string): number {
      return parseInt(input, 10);
   }
   isValid(value: string) {
      return !isNaN(Number(value));
   }
}

// Discord
export class ArgChannel extends Type {
   typeValue: string;
   constructor(data?: string) {
      super(data);
      this.typeId = "float";
   }
   parse(input: string): number {
      return new TextChannel();
   }
   isValid(value: string) {
      return true;
   }
}
export class ArgMember extends Type {
   constructor() {
      super();
   }
   syntax() {
      return `@${this.typeId}`;
   }
}

enum TypeError {

} */
