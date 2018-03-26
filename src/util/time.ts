import config from '../config';
import { weekday, leadingZeros, format } from '@toba/tools';

/**
 * Return AM or PM
 */
export const hourOfDay = (h: number) => (h > 12 ? 'PM ' + (h - 12) : 'AM ' + h);

export function toLogTime(text: string): string {
   const d = new Date(text);
   //var logOffset = d.getTimezoneOffset();
   //var localOffset = (new Date()).getTimezoneOffset();

   // just be dumb for now
   if (config.isProduction) {
      d.setHours(d.getHours() - 6);
   }

   return format(
      '{0}/{1} {2} {3}:{4}:{5}.{6}',
      d.getMonth() + 1,
      d.getDate(),
      weekday[d.getDay()],
      hourOfDay(d.getHours()),
      leadingZeros(d.getMinutes(), 2),
      leadingZeros(d.getSeconds(), 2),
      leadingZeros(d.getMilliseconds(), 3)
   );
}

export const timeZoneOffset = (date = new Date()) =>
   config.timeZone + (inDaylightSavings(date) ? 1 : 0);

/**
 * Convert decimal hours to hours:minutes
 */
export function hoursAndMinutes(hours: number): string {
   const h = Math.floor(hours);
   const m = hours - h;

   return h + ':' + leadingZeros(Math.round(60 * m), 2);
}
