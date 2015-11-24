# 2.1.0
## Features
- Download post as PDF

# 2.0.1
## Features
- Show progress while GPX file is downloaded and parsed
- Change footer to show GitHub version
- Tweak map track and point colors

## Bug Fixes
- Can't delete cached map for post series
- Remove debug code that was forcing Redis cache
- Don't sort null arary in admin view
- Remove IDE workspace settings from source control
- Correct error logging for GPX download

# 2.0.0
## Features
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

## Bug Fixes
- Trailing quote wasn't converted to curly quote if preceded by a comma
- Search page is broken
- Fail-over cache to in-memory if unable to access web-based provider
- Re-position map overlays to avoid overlaps

# 1.x
A few years of work