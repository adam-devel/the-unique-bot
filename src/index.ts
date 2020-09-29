import * as templates from './template/index';
import { get } from './firestore/Configuration';
import { Manager } from './commands/Manager';
import { joke, compliment, purge, populate, kick, image } from './commands/commands';
import { logger } from './lib/log';
import { ChannelPropery } from './firestore/types';
import { Guild } from 'discord.js';
// Envirenment Variables
import { DISCORD_SECRET } from './.secret.json';

const { info } = logger('Main');

export const Bot = new Manager();
Bot.once('ready', () => {
   const { user } = Bot;
   info(`login as ${user.tag}`);
   setTimeout(() => {
      user.setActivity('Looking after "Sweet Home" and some other servers');
   }, 1000 * 16);
});

// register commands
info('registering commands');
Bot.register(joke);
Bot.register(compliment);
Bot.register(purge);
Bot.register(populate);
Bot.register(kick);
Bot.register(image);
// Welcome New Members
Bot.on('guildMemberAdd', (member) => {
   get(member.guild).then((guild) => {
      guild.ifHasText(ChannelPropery.Job.Welcome, (channel) => {
         channel.send(templates.member(member).welcome);
         guild.ifHasText(ChannelPropery.Job.Rules, (rules) => {
            rules.send(templates.channel(rules).sendto);
         });
      });
   });
});

const pending: Map<string, { guilds: Guild[]; content: string }> = new Map();
Bot.on('message', (message) => {
   // confession management
   // ! need serious refactoring
   if (message.author.bot) {
      return;
      // ! this is duplicated in ./src/commands/Manager.ts:18
   }

   let guild = null;
   const { channel, author } = message;
   if (channel.type === 'dm') {
      if (pending.has(author.id)) {
         let idx = parseInt(message.content);
         if (isNaN(idx)) {
            channel.send(`your choice is not a number, choose again please`);
            return;
         }
         const { guilds, content } = pending.get(author.id);
         if (!(--idx in guilds)) {
            channel.send('your choice is out of range');
            return;
         }
         guild = guilds[idx];
         message.content = content;
      } else {
         const guilds = Bot.guilds.cache.array().filter((g) => g.members.cache.has(author.id));
         if (guilds.length == 0) return;
         if (guilds.length == 1) {
            guild = guilds[0];
            pending.set(author.id, { guilds, content: message.content });
         } else {
            channel.send(guilds.map((g, i) => `${i + 1}- ${g.name}`));
            channel.send('choose a server to confess to: ');
            pending.set(author.id, { guilds, content: message.content });
            return;
         }
      }
   } else {
      guild = message.guild;
   }
   get(guild).then((guild) => {
      guild.ifHasText(ChannelPropery.Job.Confession, (channel) => {
         if (message.channel.id !== channel.id) {
            if (pending.has(author.id)) {
               pending.delete(author.id);
            } else return;
         }
         if (message.channel.type !== 'dm') message.delete();
         channel.send(templates.message(message).confession);
      });
   });
});

// Bot id: 679986715229814794
// invite url: https://discord.com/oauth2/authorize?client_id=679986715229814794&scope=bot&permissions=37219398
Bot.login(DISCORD_SECRET);
