Trail Image
===========
Flickr front-end with Reddis Cloud caching

[![Build Status](https://travis-ci.org/Jason-Abbott/Trail-Image.svg?branch=master)](https://travis-ci.org/Jason-Abbott/Trail-Image)

Externs
=======
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