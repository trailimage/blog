import {
   JsonLD,
   ld,
   image,
   breadcrumb,
   organization,
   webPage,
   place
} from '@toba/json-ld';
import { Category, Post, photoBlog } from './models/index';
import { is } from '@toba/tools';
import config from './config';

export { serialize } from '@toba/json-ld';

const pathUrl = (path: string) => config.site.url + '/' + path;

const postPlace = (post: Post) =>
   place(config.site.url + '/' + post.key + '/map');

const configPage = (path: string = '') => webPage(pathUrl(path));

const configOrg = () =>
   organization(config.site.title, config.site.companyLogo);

export function owner(): JsonLD.Person {
   return ld<JsonLD.Person>('Person', {
      name: config.owner.name,
      url: config.site.url + '/about',
      sameAs: config.owner.urls,
      mainEntityOfPage: webPage('about'),
      image: image(config.owner.image)
   });
}

/**
 * http://schema.org/docs/actions.html
 * http://schema.org/SearchAction
 * https://developers.google.com/structured-data/slsb-overview
 */
export function searchAction(): JsonLD.SearchAction {
   const qi = 'query-input';
   const placeHolder = 'search_term_string';

   return ld<JsonLD.SearchAction>('SearchAction', {
      target: config.site.url + '/search?q={' + placeHolder + '}',
      [qi]: 'required name=' + placeHolder
   });
}

export function discoverAction(post: Post): JsonLD.DiscoverAction {
   return ld<JsonLD.DiscoverAction>('DiscoverAction', {
      target: config.site.url + '/' + post.key + '/map'
   });
}

/**
 * https://developers.google.com/structured-data/testing-tool/
 * https://developers.google.com/structured-data/rich-snippets/articles
 */
export function fromPost(post: Post) {
   const categoryTitle = Object.keys(post.categories).map(
      key => post.categories[key]
   );
   const schema: JsonLD.BlogPosting = {
      author: owner(),
      name: post.title,
      headline: post.title,
      description: post.description,
      image: image(post.coverPhoto.size.normal),
      publisher: configOrg(),
      mainEntityOfPage: configPage(post.key),
      datePublished: post.createdOn,
      dateModified: post.updatedOn,
      articleSection: categoryTitle.join(',')
   };

   if (post.chronological && post.centroid != null) {
      schema.locationCreated = postPlace(post);
      schema.potentialAction = discoverAction(post);
   }

   // implement video when full source data is ready
   // ld.video = Factory.fromVideo(post.video);

   //if (is.empty(post.photoTagList)) {
   //	content.keywords = config.keywords;
   //} else {
   //	content.keywords = config.alwaysKeywords + post.photoTagList;
   //}

   if (is.value(post.coverPhoto.size.thumb)) {
      (schema.image as JsonLD.ImageObject).thumbnail = image(
         post.coverPhoto.size.thumb
      );
   }

   return ld<JsonLD.BlogPosting>('BlogPosting', schema);
}

/**
 * https://developers.google.com/structured-data/breadcrumbs
 */
export function fromCategory(
   category: Category,
   key: string = category.key,
   homePage = false
): JsonLD.Blog | JsonLD.WebPage {
   if (homePage) {
      return ld<JsonLD.Blog>('Blog', {
         url: config.site.url,
         name: config.site.title,
         author: owner(),
         description: config.site.description,
         mainEntityOfPage: configPage(),
         potentialAction: searchAction(),
         publisher: configOrg()
      });
   } else {
      const schema = webPage(key);
      let position = 1;

      schema.name = category.title;
      schema.publisher = configOrg();
      schema.breadcrumb = [breadcrumb(config.site.url, 'Home', position++)];

      if (category.key.includes('/')) {
         // implies category is a subscategory
         const rootKey = category.key.split('/')[0];
         const rootCategory = photoBlog.categoryWithKey(rootKey);
         schema.breadcrumb.push(
            breadcrumb(
               config.site.url + '/' + rootCategory.key,
               rootCategory.title,
               position++
            )
         );
      }
      schema.breadcrumb.push(
         breadcrumb(
            config.site.url + '/' + category.key,
            category.title,
            position
         )
      );
      return schema;
   }
}

/**
 * Linked Data for YouTube video
 */
export function fromVideo(v: any): JsonLD.VideoObject {
   return v == null || v.empty
      ? null
      : ld<JsonLD.VideoObject>('VideoObject', {
           contentUrl: 'https://www.youtube.com/watch?v=' + v.id,
           videoFrameSize: v.width + 'x' + v.height,
           description: null,
           uploadDate: null,
           thumbnailUrl: null
        });
}
