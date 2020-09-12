// TODO: invent a better, more integrted logging system, it should include logging to the server too

export const palette = require('ansi-colors');

palette.theme({
   info: palette.blue,
   warn: palette.yellow,
   error: palette.red,
});

export function logger(label: string) {
   return {
      warn(message: string) {
         console.warn(`${palette.warn(`[${label}::Wrn]`)} ${message}`);
         //console.warn(`[Wrn][${label}]: ${message}`);
      },
      error(message: string) {
         console.error(`${palette.error(`[${label}::Err]`)} ${message}`);
         //console.error(`[Err][${label}]: ${message}`);
      },
      info(message: string) {
         console.log(`${palette.info(`[${label}::Inf]`)} ${message}`);
         // console.log(`[Info][${label}]: ${message}`);
      },
   };
}
