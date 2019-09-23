## 4.3.1

- Update Google API and other dependencies

## 4.3.0

-  Adjust design for more white space
-  Update jQuery version

## 4.2.1

-  Update dependencies and copyright date

## 4.2.0

-  Improve layout for mobile

## 4.1.7

-  Shorten threshold for block quoting and make condition stricter for poem formatting

## 4.1.6

-  Fix block quote when it's the entire caption (issue #131)

## 4.1.5

-  Fix external map links

## 4.1.4

-  Update copyright date
-  Fix lens name normalization
-  Fix post category icon
-  Increase post cache capacity

## 4.1.3

-  Use secure YouTube link

## 4.1.2

-  Fix navigation ordering (was reversed)

## 4.1.1

-  Fix Mapbox pin image reference to use HTTPS

## 4.1.0

-  Add option to require an SSL connection

## 4.0.2

-  Fix unhandled error for missing GPX

## 4.0.1

-  Fix GPX download

## 4.0.0

-  Rewrite as separate modules
-  Update dependencies

## 3.0.5

-  Update dependencies

## 3.0.4

-  Update dependencies

## 3.0.3

-  Switch to Yarn package manager
-  Update dependencies

## 3.0.2

-  Fix exposure time always showing one second

## 3.0.1

-  Fix alignment in map legend
-  Enable mobile map rotate to allow mobile zoom
-  Enlarge mobile photo buttons
-  Fix video link button

## 3.0.0

-  Change map provider to Mapbox
-  Add map view of all posts
-  Remove some web fonts (performance)
-  Convert codebase to TypeScript

## 2.2.4

-  Fix bad GPX caching in Redis

## 2.2.3

-  Update dependencies
-  Use memory instead of Redis to cache views

## 2.2.2

-  Fix missing JSON-LD @type for blog entries

## 2.2.1

-  Update Google tokens and fix authorization views

## 2.2.0

-  Use in-memory caching rather than Redis for views
-  Update dependencies

## 2.1.3

-  Adjust layout for iPad
-  Remove "Photography" from title
-  Update to latest jQuery
-  Fix RSS feed
-  Make lightbox image draggable for mobile

## 2.1.2

-  Update dependencies
-  Retry track load after deleting post cache

## 2.1.1

-  Handle unmatched photo tag searches
-  Upgrade to latest Google APIs

## 2.1.0

-  Rewrite with Promises and functional style
-  Upgrade to latest Google APIs

## 2.0.21

#### Fixes

-  Missing URL in og:image meta tag

## 2.0.20

#### Fixes

-  Handle missing primary image in Flickr set and fix poetry formatting
-  Wrong travel mode icons in top menu

## 2.0.19

#### Fixes

-  Post tags broken in mobile menu (regression)

## 2.0.18

#### Features

-  Tag category page for breadcrumb SEO
-  Make default post tag configurable
-  Switch to JSON-LD
-  Switch from gulp-minify-css to gulp-cssnano
-  Removed view details from models
-  Optimized post tag controller to avoid model interrogations when view is cached

## 2.0.17

#### Features

-  Make logged URLs live links
-  Incorporate PDF work-to-date

#### Fixes

-  Legitimate photo not found being retried as if it's a failure
-  Logging host URL as client URL

## 2.0.16

#### Fixes

-  Incorrect slug for some photo tags causing 404s

## 2.0.15

#### Fixes

-  Better logging for Flickr connectivity issues

## 2.0.14

#### Fixes

-  Trailing return in footnotes breaks formatting
-  Admin screen regression causing map item NPE

## 2.0.13

#### Features

-  Refactor Google OAuth to support different APIs
-  Use indexing modules (namespaces) to remove module require paths

#### Fixes

-  Incorrect date check causing unecessary downloads of domain spam list

## 2.0.12

#### Features

-  Add page for internal server errors

#### Fixes

-  Circular module dependency was creating NPEs

## 2.0.11

#### Fixes

-  Correct mapping for old blog URL

## 2.0.10

#### Features

-  Allow icons in log entries

#### Fixes

-  Map back button overlapped map type menu
-  Reloading map doesn't reload track when caching is disabled
-  Memory cache log reference NPE
-  Post tag page may render before all post description are loaded
-  Several new tests

## 2.0.9

#### Features

-  Block analytics referral spam

## 2.0.8

#### Fixes

-  Link names are shortened incorrectly if they end with an anchor (test created)
-  Refresh Google Drive access token before it expires

## 2.0.7

#### Fixes

-  Haiku formatting error

## 2.0.6

#### Fixes

-  Correct logging of GPX download error message
-  Trying to zoom an image with no larger size does nothing
-  Failing to format poetry (Robert Limbert in "Across Swan Falls Dam")
-  Don't shorten link names that aren't URLs
-  URL decode displayed link names
-  Bottom mobile nav items overlapped other elements

## 2.0.5

#### Fixes

-  Google Drive credentials not refreshing

## 2.0.4

#### Fixes

-  Post descriptions not refreshing when cache is invalidated

## 2.0.3

#### Fixes

-  Unable to refresh library or photo tags

## 2.0.2

#### Features

-  Minor layout tweaks

#### Fixes

-  Unable to reload cached GPX track
-  Remove media summary from post description

## 2.0.1

#### Features

-  Show progress while GPX file is downloaded and parsed
-  Change footer to show GitHub version
-  Tweak map track and point colors

#### Fixes

-  Can't delete cached map for post series
-  Remove debug code that was forcing Redis cache
-  Don't sort null array in admin view
-  Remove IDE workspace settings from source control
-  Correct error logging for GPX download

# 2.0.0

#### Features

-  Upgrade engine dependency to Node 5.x from 4.x
-  Add unit tests (partial)
-  Refactor data modules as dependency injected providers
-  Add semantic attributes to HTML
-  Create classes to support GeoJSON structures
-  Common OAuth2 methods for providers
-  Upgrade to jQuery 2.x
-  Javascript zoom on post images instead of link to Flickr size
-  Lazy-load GPX files from cloud drive instead of uploading
-  Separate management of cached GeoJSON

#### Fixes

-  Trailing quote wasn't converted to curly quote if preceded by a comma
-  Search page is broken
-  Fail-over cache to in-memory if unable to access web-based provider
-  Re-position map overlays to avoid overlaps

# 1.x

A few years of work
