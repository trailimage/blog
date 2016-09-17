'use strict';

const ld = require('../lib/json-ld');
const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../lib/factory');
/** @type {Post} */
let post = null;
/** @type {Category} */
let category = null;

factory.inject.flickr = require('./mocks/flickr.mock');

describe('JSON-LD', ()=> {
   before(() => factory.buildLibrary().then(library => {
      post = library.postWithID('72157666685116730');
      category = library.categoryWithKey('what');
      return post.getPhotos();
   }));

   it('creates link data for posts', ()=> {
      const schema = ld.fromPost(post);

      expect(schema).to.contain.all.keys(['author','name','publisher','headline','articleSection']);
      expect(schema).has.property('@context', 'http://schema.org');
      expect(schema.name).equals('Spring Fish & Chips');
      expect(schema.headline).equals(schema.name);
      expect(schema.author).has.property('name', 'Jason Abbott');
      expect(schema.publisher).has.property('name', 'Trail Image');
      expect(schema.articleSection).to.contain('Family')
   });

   it('creates link data for categories', ()=> {
      const schema = ld.fromCategory(category);


   });

   it('serializes link data', ()=> {
      const target = '{"author":'
         + '{"name":"Jason Abbott","url":"http://www.trailimage.com/about","sameAs":['
         +     '"https://www.facebook.com/jason.e.abbott",'
         +     '"http://www.flickr.com/photos/boise",'
         +     '"https://www.youtube.com/user/trailimage",'
         +     '"https://twitter.com/trailimage"'
         + '],"mainEntityOfPage":{"@id":"http://www.trailimage.com/about","@type":"WebPage"},'
         + '"image":{"url":"http://www.trailimage.com/img/face4_300px.jpg","width":300,"height":300,"@type":"Image"},'
         + '"@type":"Person"},"name":"Spring Fish & Chips","headline":"Spring Fish & Chips",'
         + '"description":"Photography’s highest form is sometimes likened to poetry, capturing experiences that defy denotation. Both are diminished to the extent they require explanation, some say, so hopefully coercing them to explain each other is a right born of two wrongs.",'
         + '"image":{"url":"https://farm9.staticflickr.com/8109/8459503474_7fcb90b3e9_b.jpg","width":1024,"height":688,"@type":"Image"},'
         + '"publisher":{"name":"Trail Image","logo":{"url":"http://www.trailimage.com/img/logo-large.png","width":200,"height":200,"@type":"Image"},'
         + '"@type":"Organization"},"mainEntityOfPage":{"@id":"http://www.trailimage.com/spring-fish--chips","@type":"WebPage"},'
         + '"datePublished":"2011-01-01T02:14:07.000Z","dateModified":"2016-06-04T22:07:20.000Z","articleSection":"2016,Boise River,Family,Bicycle","@type":"","@context":"http://schema.org"}';
      const source = ld.serialize(ld.fromPost(post));

      expect(source).equals(target);
   });
});