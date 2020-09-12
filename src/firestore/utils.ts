import {
   Server,
   ObjectChannel,
   DataChannel,
   isTextData,
   isVoiceData,
   ServerData,
   ChannelPropery,
   isText,
   isVoice,
   isGeneric,
} from './types';
import { TextChannel, VoiceChannel, GuildChannel } from 'discord.js';
import { Bijection } from '../lib/Bijection';
export function toChannel(server: Server, channel: GuildChannel): ObjectChannel.Generic {
   if (isText(channel)) {
      return new TextChannel(server, { id: channel.id });
   } else if (isVoice(channel)) {
      return new VoiceChannel(server, { id: channel.id });
   }
}
export function dataToObject(server: Server, data: DataChannel.Generic): ObjectChannel.Generic {
   if (isTextData(data)) {
      return new TextChannel(server, { id: data.id });
   } else if (isVoiceData(data)) {
      return new VoiceChannel(server, { id: data.id });
   }
}
type rawT = ServerData<DataChannel.List>;
type T = ServerData<ObjectChannel.List>;
export function converter(server: Server): FirebaseFirestore.FirestoreDataConverter<T> {
   return {
      fromFirestore(snapshot: rawT): T {
         const map: ObjectChannel.List = new Bijection();
         const { id, name, channels } = snapshot;
         for (const [key, value] of Object.entries(channels)) {
            // todo: when key != value.media; deal with it
            const object = server.channels.cache.get(value.id);
            if (isGeneric(object)) {
               map.set(key as ChannelPropery.Job, object);
            }
         }
         return { id, name, channels: map };
      },
      toFirestore(data: T): FirebaseFirestore.DocumentData {
         const { id, name, channels } = data;
         const tmp = {};
         for (let [job, channel] of channels) {
            tmp[job] = { id: channel.id, media: channel.type };
         }
         return { id, name, channels: tmp } as rawT;
      },
   };
}
