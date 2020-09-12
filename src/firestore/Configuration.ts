import { initializeApp, credential, firestore } from 'firebase-admin';
import { logger } from '../lib/log';
import {
   ServerId,
   Server,
   ServerData,
   ChannelPropery,
   ObjectChannel,
   FireSnapshot,
   isText,
   isVoice,
} from './types';
import { Bijection } from '../lib/Bijection';
import { converter } from './utils';

// firebase
const app = initializeApp({
   databaseURL: 'https://the-unique-bot.firebaseio.com',
   credential: credential.cert(require('../../.secret.json').FIREBASE_SECRET),
});
const ServerCollection = firestore(app).collection('servers');

const serverObjects: Map<ServerId, ServerCache> = new Map();
export async function get(server: Server): Promise<ServerCache> {
   const { id } = server;
   if (serverObjects.has(id)) return serverObjects.get(id);
   const reference = ServerCollection.withConverter(converter(server)).doc(id);
   const snapshot = await reference.get();
   if (!snapshot.exists) {
      await reference.create({ id, name: server.name, channels: new Bijection() } as ServerData<
         ObjectChannel.List
      >);
   }
   const serverCache = new ServerCache(server, snapshot);
   serverObjects.set(id, serverCache);
   return serverCache;
}

class ServerCache {
   private channels: Bijection<ChannelPropery.Job, ObjectChannel.Generic> = new Bijection();
   constructor(readonly server: Server, readonly snapshot: FireSnapshot) {
      this.channels = (snapshot.data() as ServerData<ObjectChannel.List>).channels;
      // channels.forEach((channel, job) => {
      //    this.channels.set(job, channel);
      // });
   }
   private has(job: ChannelPropery.Job): boolean {
      return this.channels.has(job);
   }
   private get(job: ChannelPropery.Job): ObjectChannel.Generic {
      if (this.has(job)) return this.channels.get(job);
      throw new Error(`couldn't find the channel "${job}"`);
   }
   hasText(job: ChannelPropery.Job): boolean {
      return this.has(job) && isText(this.get(job));
   }
   hasVoice(job: ChannelPropery.Job): boolean {
      return this.has(job) && isVoice(this.get(job));
   }
   getText(job: ChannelPropery.Job): ObjectChannel.Text {
      if (this.hasText(job)) {
         return this.get(job) as ObjectChannel.Text;
      }
      throw new Error(`the channel "${job}" isn't a text channel`);
   }
   getVoice(job: ChannelPropery.Job): ObjectChannel.Voice {
      if (this.hasVoice(job)) {
         return this.get(job) as ObjectChannel.Voice;
      }
      throw new Error(`the channel "${job}" isn't a voice channel`);
   }
   private ifHas(job: ChannelPropery.Job, cb: (c: ObjectChannel.Generic) => void) {
      if (this.has(job)) cb(this.get(job));
   }

   ifHasText(job: ChannelPropery.Job, cb: (t: ObjectChannel.Text) => void) {
      this.ifHas(job, (channel) => {
         if (isText(channel)) cb(channel);
      });
   }
   ifHasVoice(job: ChannelPropery.Job, cb: (t: ObjectChannel.Voice) => void) {
      this.ifHas(job, (channel) => {
         if (isVoice(channel)) cb(channel);
      });
   }
   set(job: ChannelPropery.Job, channel: ObjectChannel.Generic) {
      const { id } = channel;
      const { found, value } = this.channels.match((_, v) => v.id === id);
      if (found) {
         this.channels.deleteEntryByValue(value);
         this.channels.set(job, value);
      }
      this.channels.set(job, channel);
      return this;
   }
   publish(): Promise<firestore.WriteResult> {
      return this.snapshot.ref.set({
         id: this.server.id,
         name: this.server.name,
         channels: this.channels,
      });
   }
   autoFill(cb: (isfound: boolean, channel: string, err?: Error) => void) {
      const channels: Map<ChannelPropery.Job, RegExp> = new Map();
      channels.set(ChannelPropery.Job.Welcome, /(welcome|start|init)[ \-]*(page|channel)?/i);
      channels.set(ChannelPropery.Job.Rules, /rules?/i);
      channels.set(ChannelPropery.Job.Confession, /confessions?/i);
      channels.forEach((exp, job) => {
         const channel = this.server.channels.cache.find(
            (c) => c.type == 'text' && exp.test(c.name)
         );

         if (channel && (isText(channel) || isVoice(channel))) {
            this.set(job, channel)
               .publish()
               .then(() => {
                  cb(true, job);
               })
               .catch(() => {
                  cb(true, job, new Error('database problem'));
               });
         } else cb(false, job);
      });
   }
}
