import { env } from '@toba/tools';
import { Token } from '@toba/oauth';
import { ProviderConfig } from '@trailimage/google-provider';
import { domain } from './models';
import { mapSource } from './mapsource';

/**
 * @see http://code.google.com/apis/console/#project:1033232213688
 */
export const mapProvider: ProviderConfig = {
   api: {
      apiKey: env('GOOGLE_DRIVE_KEY'),
      folderID: '0B0lgcM9JCuSbMWluNjE4LVJtZWM',
      cacheSize: 0,
      useCache: false,
      auth: {
         apiKey: '',
         clientID: env('GOOGLE_CLIENT_ID'),
         secret: env('GOOGLE_SECRET'),
         callback: 'http://www.' + domain + '/auth/google',
         token: {
            type: null,
            access: env('GOOGLE_ACCESS_TOKEN', null),
            accessExpiration: null as Date,
            refresh: env('GOOGLE_REFRESH_TOKEN')
         } as Token
      }
   },
   minimumTrackLength: 0.2,
   minimumTrackPoints: 5,
   maxPointDeviationFeet: 0.5,
   maxPossibleSpeed: 150,
   privacyCenter: null as number[],
   privacyMiles: 1,
   checkPrivacy: false,
   allowDownload: true,
   maxMarkers: 70,
   link: {
      googleEarth:
         'https://earth.google.com/web/@{lat},{lon},1100a,{altitude}d,35y,0h,0t,0r',
      gaiaGPS:
         'https://www.gaiagps.com/map/?layer=GaiaTopoRasterFeet&lat={lat}&lon={lon}&zoom={zoom}'
   },
   source: mapSource
};
