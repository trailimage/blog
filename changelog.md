# 2.0.0
## Features
- Upgrade engine dependency to Node 5.x from 4.x
- Add unit tests (partial)
- Refactor data modules as dependency injected providers
- Add semantic attributes to HTML
- Create classes to support GeoJSON structures
- Common OAuth2 methods for providers
- Javascript zoom on post images instead of link to Flickr size
- Lazy-load GPX files from cloud drive instead of uploading

## Bug Fixes
- Trailing quote wasn't converted to curly quote if preceded by a comma
- Search page is broken
- Fail-over cache to in-memory if unable to access web-based provider

# 1.x
Initial work.