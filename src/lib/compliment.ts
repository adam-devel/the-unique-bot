import { getCompliment, getComplimentWithAlliteration, getOfficialCompliment } from 'knope';
import { random, sample } from 'lodash';

export default function compliment(reciever: string) {
   const length = random(20) === 10 ? random(12, 26) : random(1, 5);
   const type = sample([getCompliment, getComplimentWithAlliteration, getOfficialCompliment]);
   return type(reciever, length);
}
