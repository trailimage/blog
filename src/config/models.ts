import { env } from '@toba/node-tools';
import { OwnerConfig, SiteConfig } from '@trailimage/models';

/** Site domain name. */
export const domain = 'trailimage.com';

const url = `http://www.${domain}`;

export const owner: OwnerConfig = {
   name: 'Jason Abbott',
   image: {
      url: url + '/img/face4_300px.jpg',
      width: 300,
      height: 300
   },
   email: env('EMAIL_CONTACT'),
   urls: [
      'https://www.facebook.com/jason.e.abbott',
      'http://www.flickr.com/photos/boise',
      'https://www.youtube.com/user/trailimage',
      'https://twitter.com/trailimage'
   ]
};

export const site: SiteConfig = {
   domain,
   title: 'Trail Image',
   subtitle: 'Adventure Photography by ' + owner.name,
   description:
      'Stories, images and videos of small adventure trips in and around the state of Idaho',
   url,
   postAlias: 'Adventure',
   logo: {
      url: url + '/img/logo-large.png',
      width: 200,
      height: 200
   },
   companyLogo: {
      url: url + '/img/logo-title.png',
      width: 308,
      height: 60
   }
};
