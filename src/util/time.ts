import config from '../config';
import { inDaylightSavings, weekday, leadingZeros, format } from '@toba/tools';

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
 * Convert text to date object. Date constructor uses local time which we
 * need to defeat since local time will be different on host servers. Example:
 *
 *    2012-06-17 17:34:33
 */
export function parseDate(text: string): Date {
   const parts = text.split(' ');
   const date = parts[0].split('-').map(d => parseInt(d));
   const time = parts[1].split(':').map(d => parseInt(d));
   // convert local date to UTC time by adding offset
   const h = time[0] - config.timeZone;
   // date constructor automatically converts to local time
   const d = new Date(
      Date.UTC(date[0], date[1] - 1, date[2], h, time[1], time[2])
   );
   if (inDaylightSavings(d)) {
      d.setHours(d.getHours() - 1);
   }
   return d;
}

/**
 * Convert decimal hours to hours:minutes
 */
export function hoursAndMinutes(hours: number): string {
   const h = Math.floor(hours);
   const m = hours - h;

   return h + ':' + leadingZeros(Math.round(60 * m), 2);
}
