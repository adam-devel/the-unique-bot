import { Client, TextChannel, NewsChannel } from 'discord.js';
import { logger } from '../lib/log';
import { TokenStream } from './Interpreter';
import { Command } from './commands';

const { warn } = logger('Manager');

export class Manager extends Client {
   private prefix = ';';
   private registry: Set<Command> = new Set();
   private dictionary: Map<String, Command> = new Map();

   constructor(...args: any) {
      super(...args);
      this.on('message', (message) => {
         const { author } = message;
         // ignore DMs, and bots, including myself :/
         if (author.bot || message.channel.type === 'dm') return;
         // todo: add an API to register message events that fire only under the condition above 
         // ping
         const { content } = message;
         if (content.toLowerCase() === 'ping') {
            message.channel.send(content.replace('i', 'o').replace('I', 'O'));
            return;
         }
         // command invoking
         const sequence = new TokenStream(message.content);
         if (sequence.nomore()) return;
         let token = sequence.step();
         if (token[0] === this.prefix) {
            if (token === this.prefix) {
               if (sequence.nomore()) return;
               token = sequence.step();
            } else {
               token = token.slice(1);
            }
            if (this.dictionary.has(token)) {
               const command = this.dictionary.get(token);
               if (command.privileges.every((p) => message.member.hasPermission(p))) {
                  message.delete().finally(() => {
                     command.run(sequence, message, message.channel as TextChannel | NewsChannel);
                     sequence.close();
                  });
               } else message.channel.send(`${message.member} have no enough privileges`);
            }
         }
      });
   }

   register(command: Command) {
      // cehcks
      if (this.registry.has(command)) {
         warn(`command "${command.name}" is already registred, ignoring`);
         return;
      }
      if (command.keywords.some((key) => this.dictionary.has(key))) {
         warn(`command "${command.name}" is using a taken keyword, ignoring`);
         return;
      }
      // register
      this.registry.add(command);
      command.keywords.forEach((key) => this.dictionary.set(key, command));
   }
}
