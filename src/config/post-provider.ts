import { env } from '@toba/node-tools'
import { Flickr, ProviderConfig } from '@trailimage/flickr-provider'
import { domain } from './models'

/** Preferred photo sizes */
export const sizes = {
   thumb: [Flickr.SizeCode.Square150],
   preview: [Flickr.SizeCode.Small320],
   normal: [
      Flickr.SizeCode.Large1024,
      Flickr.SizeCode.Medium800,
      Flickr.SizeCode.Medium640
   ],
   big: [
      Flickr.SizeCode.Large2048,
      Flickr.SizeCode.Large1600,
      Flickr.SizeCode.Large1024
   ]
}

export const postProvider: ProviderConfig = {
   /** Photo sizes that must be retrieved for certain contexts */
   photoSizes: sizes,
   featureSets: [{ id: '72157632729508554', title: 'Ruminations' }],
   api: {
      userID: '60950751@N04',
      appID: '72157631007435048',
      timeZoneOffset: -7,
      setPhotoSizes: [],
      searchPhotoSizes: [Flickr.SizeCode.Square150],
      // setPhotoSizes will be copied from provider configuration
      excludeSets: ['72157631638576162'],
      excludeTags: [
         'Idaho',
         'United States of America',
         'Abbott',
         'LensTagger',
         'Boise'
      ],
      maxRetries: 10,
      retryDelay: 300,
      useCache: true,
      maxCacheSize: 500,
      auth: {
         apiKey: env('FLICKR_API_KEY'),
         secret: env('FLICKR_SECRET'),
         callback: 'http://www.' + domain + '/auth/flickr',
         token: {
            access: env('FLICKR_ACCESS_TOKEN'),
            secret: env('FLICKR_TOKEN_SECRET')
         }
      }
   }
}
