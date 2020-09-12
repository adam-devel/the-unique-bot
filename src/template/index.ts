import palette from '../lib/palette';
import { sample } from 'lodash';
import { GuildMember, TextChannel, Message, MessageEmbed, PartialGuildMember } from 'discord.js';

export function channel(channel: TextChannel) {
   return {
      get sendto() {
         return new MessageEmbed({
            color: 0xf94a58,
            title: 'Notice!',
            description: `please head over to ${channel}`,
         });
      },
   };
}
export function member(member: GuildMember | PartialGuildMember) {
   return {
      welcome(): MessageEmbed {
         const { user, guild } = member;
         const { owner } = guild;
         //const admins = guild.roles.find(role => /admin(istrator)?s?|mod(erator)?s?/i.test(role.name)).members;
         return new MessageEmbed({
            color: 0x97ad5b,
            author: {
               name: `${guild}`,
               icon_url: guild.iconURL({ size: 256 }),
            },
            title: `Welcome ${user.username} !`,
            thumbnail: { url: user.displayAvatarURL({ size: 512 }) },
            description: 'We are all pleased to have **you** here :heart:',
            fields: [
               {
                  name: 'Date',
                  value: new Date().toLocaleString('en-GB'),
               },
            ],
            footer: { text: `Owner ~ ${owner.nickname || owner.displayName}` },
         });
      },
   };
}
export function message({ content }: Message) {
   return {
      get confession(): MessageEmbed {
         return new MessageEmbed({
            color: sample(palette),
            author: {
               name: 'Anonymous',
               iconURL: 'https://img.icons8.com/cotton/2x/gender-neutral-user--v1.png',
            },
            description: content,
         });
      },
   };
}
