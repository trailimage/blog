'use strict';

const setting = require('../settings.js');
const app = require('express');
// controllers
const issue = require('./issue-controller.js');
const admin = require('./admin-controller.js');
const api = require('./api-controller.js');
const about = require('./about-controller.js');
const authorize = require('./authorize-controller.js');
const map = require('./map-controller.js');
const menu = require('./menu-controller.js');
const pdf = require('./pdf-controller.js');
const photo = require('./photo-controller.js');
const post = require('./post-controller.js');
const rss = require('./rss-controller.js');
const search = require('./search-controller.js');
const sitemap = require('./sitemap-controller.js');
const tag = require('./tag-controller.js');
// middleware
const wwwhisper = require('connect-wwwhisper');
const bodyParser = require('body-parser');
const cookies = require('cookies');
const compress = require('compression');
const outputCache = require('../output-cache.js');

/** @type {string} Slug pattern */
const s = '([\\w\\d-]{4,})';
/** @type {string} Flickr photo ID pattern */
const photoID = ':photoID(\\d{10,11})';
/** @type {string} Flickr set ID pattern */
const postID = ':postID(\\d{17})';

post.addFixes(app);

app.use(cookies.express([setting.flickr.userID, setting.facebook.adminID]));

let router = app.Router();
router.get('/', issue.view);
router.get('/:slug'+s, issue.view);
exports.issue = router;

router = app.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(wwwhisper(false));
//app.use(filter(/^\/(admin|wwwhisper)(?!.*(delete|load)$)/, wwwhisper(false)));
router.get('/', admin.home);
router.post('/view/delete', admin.deleteView);
router.post('/track/upload', admin.uploadTrack);
router.post('/library/reload', admin.reloadLibrary);
router.post('/photo-tag/reload', admin.reloadPhotoTags);
exports.admin = router;

router = app.Router();
router.get('/menu', api.menu);
router.get('/post', api.post);
exports.api = router;

app.get('/', tag.home);                                       // the latest posts
app.get('/rss', rss.view);
app.get('/about', about.view);
app.get('/authorize', authorize.view);
app.get('/js/menu-data.js', menu.view);
app.get('/sitemap.xml', sitemap.view);
app.get('/exif/'+photoID, photo.exif);
app.get('/tag-menu', tag.menu);
app.get('/search', search.view);
app.get('/:category(who|what|when|where|tag)/:tag', tag.view);
app.get('/:year(\\d{4})/:month(\\d{2})/:slug', post.blog);       // old blog links with format /YYYY/MM/slug
app.get('/photo-tag', photo.tags);
app.get('/photo-tag/:tagSlug', photo.tags);
app.get('/photo-tag/search/:tagSlug', photo.search);
app.get('/featured', post.featured);
app.get('/'+photoID, photo.view);                                 // links with bare Flickr photo ID
app.get('/'+postID, post.flickrID);                               // links with bare Flickr set ID
app.get('/'+postID+'/'+photoID, post.flickrID);
app.get('/:slug'+s+'/pdf', pdf.view);
app.get('/:slug'+s+'/map', map.view);
app.get('/:slug'+s+'/map/'+photoID, map.view);
app.get('/:slug'+s+'/geo.json', map.json);
app.get('/:groupSlug'+s+'/:partSlug'+s, post.seriesPost);
app.get('/:groupSlug'+s+'/:partSlug'+s+'/map', map.seriesView);
app.get('/:groupSlug'+s+'/:partSlug'+s+'/map/'+photoID, map.seriesView);
app.get('/:slug'+s, post.view);