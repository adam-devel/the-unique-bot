import * as templates from './template/index';
import { get } from './firestore/Configuration';
import { Manager } from './commands/Manager';
import { joke, compliment, purge, populate, kick, image } from './commands/commands';
import { logger } from './lib/log';
import { ChannelPropery } from './firestore/types';
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

Bot.on('message', (message) => {
   // confession management
   if (message.author.bot) {
      return;
      // ! this is duplicated ./src/commands/Manager.ts:18
   }
   get(message.guild).then((guild) => {
      guild.ifHasText(ChannelPropery.Job.Confession, (channel) => {
         if (message.channel.id !== channel.id) return;
         message.delete();
         channel.send(templates.message(message).confession);
      });
   });
});

// Bot id: 679986715229814794
// invite url: https://discord.com/oauth2/authorize?client_id=679986715229814794&scope=bot&permissions=37219398
Bot.login(DISCORD_SECRET);