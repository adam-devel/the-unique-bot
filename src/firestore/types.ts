import { firestore } from 'firebase-admin';
import { GuildChannel, TextChannel, VoiceChannel, Guild, Channel } from 'discord.js';
import { Bijection } from '../lib/Bijection';

// firebase
export type FireReference = firestore.DocumentReference<firestore.DocumentData>;
export type FireSnapshot = firestore.DocumentSnapshot<firestore.DocumentData>;

//alias
export type ChannelId = string;
export type ServerId = string;
export type Server = Guild;
// data structure
export namespace ChannelPropery {
   export enum Job {
      Welcome = 'welcome',
      Confession = 'confession',
      Rules = 'rules',
   }
   export enum Media {
      Voice = 'voice',
      Text = 'text',
   }
}
export namespace ObjectChannel {
   export type Text = TextChannel;
   export type Voice = VoiceChannel;
   export type Generic = Text | Voice;
   export type List = Bijection<ChannelPropery.Job, Generic>;
}
export namespace DataChannel {
   export type Generic = {
      id: ChannelId;
      media: ChannelPropery.Media;
   };
   export type Text = Generic & { media: ChannelPropery.Media.Text };
   export type Voice = Generic & { media: ChannelPropery.Media.Voice };
   export type List = { [key in ChannelPropery.Job]: Generic };
}
export type ServerData<T = ObjectChannel.List | DataChannel.List> = {
   id: ServerId;
   name: string;
   channels: T;
};

// guards
export function isText(channel: GuildChannel): channel is ObjectChannel.Text {
   return channel.type === ChannelPropery.Media.Text;
}
export function isVoice(channel: GuildChannel): channel is ObjectChannel.Voice {
   return channel.type === ChannelPropery.Media.Voice;
}
export function isGeneric(channel: GuildChannel): channel is ObjectChannel.Generic {
   return isVoice(channel)||isText(channel);
}
export function isTextData(channel: DataChannel.Generic): channel is DataChannel.Text {
   return channel.media === ChannelPropery.Media.Text;
}
export function isVoiceData(channel: DataChannel.Generic): channel is DataChannel.Voice {
   return channel.media === ChannelPropery.Media.Voice;
}
