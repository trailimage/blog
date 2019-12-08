/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts" />
/// <reference path="./browser.d.ts"/>

interface LazyLoadOptions {
   src: string;
   srcset: string;
   selector: string;
   rootMargin?: string;
   root?: Element | null;
   threshold?: number | number[];
   /** Milliseconds to delay image load */
   delayLoad?: number;
}

const defaultOptions: LazyLoadOptions = {
   src: 'data-src',
   srcset: 'data-srcset',
   selector: '.lazyload',
   root: null,
   rootMargin: '0px',
   threshold: 0,
   delayLoad: 300
};

const timerKey = 'timerid';

const getTimerID = (el: HTMLElement): number => {
   const textID = el.dataset[timerKey];
   return textID === undefined ? 0 : parseInt(textID);
};
const setTimerID = (el: HTMLElement, id: number = 0) => {
   if (id == 0) {
      delete el.dataset[timerKey];
   } else {
      el.dataset[timerKey] = id.toString();
   }
};

/**
 * Based on Lazy Load plugin by Mika Tuupola.
 * @see https://appelsiini.net/projects/lazyload
 */
class LazyLoad {
   /** Image references */
   images: NodeListOf<Element> | HTMLElement[];
   options: LazyLoadOptions;
   observer: IntersectionObserver;

   constructor(images: HTMLElement[], options: Partial<LazyLoadOptions> = {}) {
      this.options = jQuery.extend({}, options, defaultOptions);
      this.images =
         images.length > 0
            ? images
            : document.querySelectorAll(this.options.selector);

      if (window.IntersectionObserver) {
         this.observe();
      } else {
         // pre-load all image if no observer available
         console.warn('Browser does not support IntersectionObserver');
         this.images.forEach(this.loadImage);
      }
   }

   delayLoad(el: HTMLElement) {
      let timerID: number = getTimerID(el);

      if (timerID == 0) {
         timerID = setTimeout(() => {
            this.observer.unobserve(el);
            this.loadImage(el);
            setTimerID(el); // remove timer data
         }, this.options.delayLoad);

         setTimerID(el, timerID);
      }
   }

   cancelLoad(el: HTMLElement) {
      const timerID: number = getTimerID(el);
      if (timerID > 0) {
         clearTimeout(timerID);
         setTimerID(el); // remove timer data
      }
   }

   observe() {
      this.observer = new IntersectionObserver(
         entries => {
            entries.forEach(e => {
               const el = e.target as HTMLElement;
               if (e.isIntersecting) {
                  this.delayLoad(el);
               } else {
                  this.cancelLoad(el);
               }
            });
         },
         {
            root: this.options.root,
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
         }
      );
      this.images.forEach((el: Element) => this.observer.observe(el));
   }

   loadImage(el: Element) {
      const src = el.getAttribute(this.options.src);

      if (el.tagName.toLowerCase() == 'img') {
         const img = el as HTMLImageElement;
         const srcset = img.getAttribute(this.options.srcset);

         if (src !== null) {
            img.src = src;
         }
         if (srcset !== null) {
            img.srcset = srcset;
         }
      } else {
         (el as HTMLElement).style.backgroundImage = `url(${src})`;
      }
   }
}

if (jQuery) {
   const $ = jQuery;
   $.fn.lazyload = function(options: LazyLoadOptions) {
      new LazyLoad($.makeArray(this), options);
      return this;
   };
}
