import {
   hoursAndMinutes,
   sayNumber,
   leadingZeros,
   parseNumber,
   maybeNumber,
   inDaylightSavings,
   dateString,
   format,
   rot13,
   slug,
   capitalize,
   titleCase
} from '@toba/tools';

import { topDomain, encodeBase64, decodeBase64 } from './text';
import {
   typography,
   characterEntities,
   caption,
   fixMalformedLink,
   fraction,
   photoTagList,
   shortenLinkText,
   story,
   iconTag,
   postModeIcon,
   postCategoryIcon,
   logMessage
} from './html';
import {
   fromTimeStamp,
   hourOfDay,
   iso8601time,
   parseDate,
   timeZoneOffset,
   toLogTime
} from './time';

export default {
   format,
   logMessage,
   topDomain,
   slug,
   capitalize,
   titleCase,

   date: {
      fromTimeStamp,
      hoursAndMinutes,
      hourOfDay,
      inDaylightSavings,
      iso8601time,
      parse: parseDate,
      timeZoneOffset,
      toString: dateString,
      toLogTime
   },

   encode: {
      rot13,
      toBase64: encodeBase64,
      fromBase64: decodeBase64,
      characterEntities
   },

   html: {
      typography,
      caption,
      fixMalformedLink,
      fraction,
      photoTagList,
      shortenLinkText,
      story
   },

   icon: {
      tag: iconTag,
      mode: postModeIcon,
      category: postCategoryIcon
   },

   number: {
      say: sayNumber,
      pad: leadingZeros,
      parse: parseNumber,
      maybe: maybeNumber
   }
};
