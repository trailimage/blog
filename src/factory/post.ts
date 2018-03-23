import { Flickr, FeatureSet } from '@toba/flickr';
import { slug, is } from '@toba/tools';
import { Post, Photo, photoBlog } from '../models/';
import { identifyOutliers } from '../models/photo';
import re from '../regex';
import { makeVideoInfo, makePhoto, flickr, timeStampToDate } from './';

/**
 * Create post from Flickr photo set.
 *
 * @param chronoligical Whether set photos occurred together at a point in time
 */
export function make(
   flickrSet: Flickr.SetSummary | FeatureSet,
   chronological: boolean = true
): Post {
   const p = new Post();

   p.id = flickrSet.id;
   p.chronological = chronological;

   assignFactoryMethods(p);

   const parts = p.originalTitle.split(re.subtitle);

   p.title = parts[0];

   if (parts.length > 1) {
      p.subTitle = parts[1];
      p.seriesKey = slug(p.title);
      p.partKey = slug(p.subTitle);
      p.key = p.seriesKey + '/' + p.partKey;
   } else {
      p.key = slug(p.originalTitle);
   }
   return p;
}

/**
 * Assign post methods to lazy-load content.
 */
function assignFactoryMethods(p: Post): Post {
   p.getInfo = async () =>
      p.infoLoaded
         ? p
         : flickr.getSetInfo(p.id).then(info => updateInfo(p, info));

   p.getPhotos = async () =>
      p.photosLoaded
         ? p.photos
         : flickr.getSetPhotos(p.id).then(res => updatePhotos(p, res));

   return p;
}

function updateInfo(p: Post, setInfo: Flickr.SetInfo): Post {
   const thumb = `http://farm${setInfo.farm}.staticflickr.com/${
      setInfo.server
   }/${setInfo.primary}_${setInfo.secret}`;

   // removes video information from setInfo.description
   p.video = makeVideoInfo(setInfo);
   p.createdOn = timeStampToDate(setInfo.date_create);
   p.updatedOn = timeStampToDate(setInfo.date_update);
   p.photoCount = setInfo.photos;
   p.description = setInfo.description._content.replace(/[\r\n\s]*$/, '');
   // long description is updated after photos are loaded
   p.longDescription = p.description;
   // http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
   // http://farm{{info.farm}}.static.flickr.com/{{info.server}}/{{info.primary}}_{{info.secret}}.jpg'
   // thumb URLs may be needed before photos are loaded, e.g. in RSS XML
   p.bigThumbURL = thumb + '.jpg'; // 500px
   p.smallThumbURL = thumb + '_s.jpg';
   p.infoLoaded = true;

   return p;
}

function updatePhotos(p: Post, setPhotos: Flickr.SetPhotos): Photo[] {
   p.photos = setPhotos.photo.map((img, index) => makePhoto(img, index));

   if (p.photos.length > 0) {
      p.coverPhoto = p.photos.find(img => img.primary);

      if (!is.value(p.coverPhoto)) {
         log.error(`No cover photo defined for ${p.title}`);
         p.coverPhoto = p.photos[0];
      }

      // also updates photo tag keys to full names
      p.photoTagList = photoBlog.photoTagList(p.photos);

      if (p.chronological) {
         identifyOutliers(p.photos);
         const firstDatedPhoto = p.photos.find(i => !i.outlierDate);
         if (is.value(firstDatedPhoto)) {
            p.happenedOn = firstDatedPhoto.dateTaken;
         }
      }

      if (!is.empty(p.description)) {
         p.longDescription = `${p.description} (Includes ${
            p.photos.length
         } photos`;
         p.longDescription +=
            is.value(p.video) && !p.video.empty ? ' and one video)' : ')';
      }

      p.updatePhotoLocations();
   }
   p.photosLoaded = true;

   return p.photos;
}
