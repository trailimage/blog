const admin = require('./admin');
const auth = require('./auth');
const category = require('./category');
const map = require('./map');
const menu = require('./menu');
const photo = require('./photo');
const post = require('./post');
const rss = require('./rss');
const s = require('./static');

module.exports = {
   about: s.about,
   search: s.search,
   siteMap: s.siteMap,
   issues: s.issues,
   rss,
   post,
   map,
   photo,
   menu,
   auth,
   category,
   admin
};