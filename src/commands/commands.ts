import { TokenStream } from './Interpreter';
import { Message, PermissionString, TextChannel, NewsChannel } from 'discord.js';
import { logger } from '../lib/log';
import { sample } from 'lodash';
import c from '../lib/compliment';
import { get } from '../firestore/Configuration';
import { PIXABAY_SECRET } from '../.secret.json';
const phin = require('phin');
const { error } = logger('Command');

export type Command = {
   name: string;
   desc: string;
   privileges: PermissionString[];
   keywords: string[];
   run(sequence: TokenStream, message: Message, channel?: TextChannel | NewsChannel): void;
};

export const joke: Command = {
   name: 'joke',
   desc: 'random jokes from https://icanhazdadjoke.com/ and https://sv443.net/',
   keywords: ['joke'],
   privileges: [],
   run(_, { channel }: Message) {
      phin({
         url: sample([
            'https://sv443.net/jokeapi/v2/joke/Any?&format=txt',
            'https://icanhazdadjoke.com/',
         ]),
         headers: { accept: 'text/plain' },
      })
         .then((res) => channel.send(res.body.toString(), { code: true }))
         .catch((e) => error(`joke: ${e}`));
   },
};

export const purge: Command = {
   name: 'purge',
   desc: 'purge the last message, or messages',
   privileges: ['MANAGE_MESSAGES'],
   keywords: ['purge', 'p'],
   run(sequence: TokenStream, _message: Message, channel) {
      let n = sequence.anymore() ? parseInt(sequence.step()) : 1;
      channel.bulkDelete(n);
   },
};

export const compliment: Command = {
   name: 'compliment',
   desc: 'give compliments',
   keywords: ['comp', 'compliment'],
   privileges: [],
   run(_sequence: TokenStream, { channel, member: commander, mentions }: Message) {
      const mentioned = mentions.members;
      let reciever = '';
      if (mentioned.size > 0) {
         mentioned.forEach((m) => {
            reciever += (reciever === '' ? '' : ', ') + m.toString();
         });
      } else {
         reciever = commander.toString();
      }
      channel.send(c(reciever));
   },
};

export const populate: Command = {
   name: 'populate',
   desc: 'automatically choose the right channels and try to be clever about its',
   keywords: ['pop', 'populate'],
   privileges: ['ADMINISTRATOR'],
   run(_: TokenStream, { guild, channel }: Message) {
      get(guild).then((guild) => {
         guild.autoFill((found, name, err?: Error) => {
            channel.send(`- "${name}" channel is ${found ? '' : 'not'} found`);
            if (err) {
               channel.send(`- Database Error: couldn't add "${name}" to the database`);
               error(err.message);
            }
         });
      });
   },
};

export const kick: Command = {
   name: 'kick',
   desc: 'automatically choose the right channels and try to be clever about its',
   keywords: ['kick'],
   privileges: ['KICK_MEMBERS'],
   run(_sequence, message) {
      const { mentions, channel } = message;
      mentions.members.forEach((member) => {
         if (member.kickable) {
            member.kick().then((m) => {
               channel.send(`${m} got kicked`);
            });
         } else {
            channel.send('I have no permissions to kick this user');
         }
      });
   },
};
