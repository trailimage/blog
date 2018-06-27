"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const models_1 = require("./models");
const mapsource_1 = require("./mapsource");
exports.mapProvider = {
    api: {
        apiKey: tools_1.env('GOOGLE_DRIVE_KEY'),
        folderID: '0B0lgcM9JCuSbMWluNjE4LVJtZWM',
        cacheSize: 0,
        useCache: false,
        auth: {
            apiKey: '',
            clientID: tools_1.env('GOOGLE_CLIENT_ID'),
            secret: tools_1.env('GOOGLE_SECRET'),
            callback: 'http://www.' + models_1.domain + '/auth/google',
            token: {
                type: null,
                access: tools_1.env('GOOGLE_ACCESS_TOKEN', null),
                accessExpiration: null,
                refresh: tools_1.env('GOOGLE_REFRESH_TOKEN')
            }
        }
    },
    minimumTrackLength: 0.2,
    minimumTrackPoints: 5,
    maxPointDeviationFeet: 0.5,
    maxPossibleSpeed: 150,
    privacyCenter: null,
    privacyMiles: 1,
    checkPrivacy: false,
    allowDownload: true,
    maxMarkers: 70,
    link: {
        googleEarth: 'https://earth.google.com/web/@{lat},{lon},1100a,{altitude}d,35y,0h,0t,0r',
        gaiaGPS: 'https://www.gaiagps.com/map/?layer=GaiaTopoRasterFeet&lat={lat}&lon={lon}&zoom={zoom}'
    },
    source: mapsource_1.mapSource
};
