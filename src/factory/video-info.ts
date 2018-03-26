import { Flickr } from '@toba/flickr';
import { VideoInfo } from '../models/';
import re from '../regex';

/**
 * Get video ID and dimensions
 */
export function make(setInfo: Flickr.SetInfo): VideoInfo {
   const d = setInfo.description._content;

   if (re.video.test(d)) {
      const match = re.video.exec(d);
      // remove video link from description
      setInfo.description._content = d.replace(match[0], '');
      return new VideoInfo(match[4], parseInt(match[2]), parseInt(match[3]));
   } else {
      return null;
   }
}
