[![Build Status](https://travis-ci.org/Jason-Abbott/Trail-Image.svg?branch=master)](https://travis-ci.org/Jason-Abbott/Trail-Image)
[![Code Climate](https://codeclimate.com/github/Jason-Abbott/Trail-Image/badges/gpa.svg)](https://codeclimate.com/github/Jason-Abbott/Trail-Image)
[![David](https://david-dm.org/Jason-Abbott/Trail-Image.svg)](https://david-dm.org/Jason-Abbott/Trail-Image)

# Overview
Frictionless photo blogging platform that leverages existing social media and cloud storage to dynamically generate an engaging and responsive story experience.

# Providers
Flexibility is facilitated with the use of dependency injected data providers for photos, GPS tracks, caching and logging. New providers are continually being developed.

## <a name="oauth"></a>OAuth
Most providers authenticate with OAuth 1.0A or 2.0. Settings can be managed with an instance of `lib/auth/oauth-options.js`.

## Photos
Photo providers inherit from `lib/providers/photo-base.js`.

### Flickr

#### Settings

##### Required
- `userID`
- `appID`
- [oauth-options](#oauth)

##### Optional
- `featureSets`

### Instagram
Under development.

### Google Plus
Under development.

## GPS Tracks
GPS track providers inherit from `lib/map/map-base.js`.

### Google Drive
#### Settings

##### Required
- `apiKey`
- `tracksFolder`
- [oauth-options](#oauth)

##### Optional
`featureSets`

### Dropbox
Under development.

## Caching
Cache providers inherit from `lib/cache/cache-base.js`.

### In-memory

### Redis

## Logging
Log providers inherit from `lib/log/log-base.js`.

### Console

### Redis

# Build

https://github.com/google/closure-compiler/tree/master/contrib/externs

## Fonts
[Google Fonts](http://www.google.com/fonts/) are pre-downloaded using
[webfont-dl](https://github.com/mmastrac/webfont-dl). A `webfont` script in `package.json`
performs the download. To enable the script, first run

```
npm install -g webfont-dl
```
Then run the script itself with
```
npm run webfont
```
It shouldn't need to be run, though, unless there's a change to the fonts used.

# Roadmap

- [ ] Mongo cache provider
- [ ] Firebase cache provicer
- [ ] Dropbox GPX provider