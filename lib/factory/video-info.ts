import re from '../regex';

/**
 * Get video ID and dimensions
 */
function make(setInfo:Flickr.SetInfo):any {
   const d = setInfo.description._content;

   if (re.video.test(d))	{
      const match = re.video.exec(d);
      // remove video link from description
      setInfo.description._content = d.remove(match[0]);
      return {
         id: match[4],
         width: parseInt(match[2]),
         height: parseInt(match[3]),
         get empty() { return this.width === 0 || this.height === 0; }
      };
   } else {
      return null;
   }
}

export default { make };
