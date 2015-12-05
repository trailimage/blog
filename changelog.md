## 2.0.8
### Bug Fixes
- Link names are shortened incorrectly if they end with an anchor (test created)
- Refresh Google Drive access token before it expires

## 2.0.7
### Bug Fixes
- Haiku formatting error

## 2.0.6
### Bug Fixes
- Correct logging of GPX download error message
- Trying to zoom an image with no larger size does nothing
- Failing to format poetry (Robert Limbert in "Across Swan Falls Dam")
- Don't shorten link names that aren't URLs
- URL decode displayed link names
- Bottom mobile nav items overlapped other elements

## 2.0.5
### Bug Fixes
- Google Drive credentials not refreshing

## 2.0.4
### Bug Fixes
- Post descriptions not refreshing when cache is invalidated

## 2.0.3
### Bug Fixes
- Unable to refresh library or photo tags

## 2.0.2
### Features
- Minor layout tweaks

### Bug Fixes
- Unable to reload cached GPX track
- Remove media summary from post description

## 2.0.1
### Features
- Show progress while GPX file is downloaded and parsed
- Change footer to show GitHub version
- Tweak map track and point colors

### Bug Fixes
- Can't delete cached map for post series
- Remove debug code that was forcing Redis cache
- Don't sort null array in admin view
- Remove IDE workspace settings from source control
- Correct error logging for GPX download

# 2.0.0
### Features
- Upgrade engine dependency to Node 5.x from 4.x
- Add unit tests (partial)
- Refactor data modules as dependency injected providers
- Add semantic attributes to HTML
- Create classes to support GeoJSON structures
- Common OAuth2 methods for providers
- Upgrade to jQuery 2.x
- Javascript zoom on post images instead of link to Flickr size
- Lazy-load GPX files from cloud drive instead of uploading
- Separate management of cached GeoJSON

### Bug Fixes
- Trailing quote wasn't converted to curly quote if preceded by a comma
- Search page is broken
- Fail-over cache to in-memory if unable to access web-based provider
- Re-position map overlays to avoid overlaps

# 1.x
A few years of work