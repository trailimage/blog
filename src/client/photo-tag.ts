/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts"/>
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>

/**
 * Defined in /views/photo-tag.hbs
 */
declare const selectedTag: string;
declare const siteName: string;

$(function() {
   const emptyTag = '-';
   const css = 'selected';
   const $status = $('#status');
   const $letters = $('#letters');
   const $selectors = $('#selectors');
   const $thumbs = $('#thumbs');
   const id = 'item-' + selectedTag.substr(0, 1).toLowerCase();
   /** Tag selection list for current letter */
   let $selector = $selectors.find('#' + id);
   /** Currently selected letter */
   let $li = $letters.find('li[data-for=' + id + ']');

   $selector.val(selectedTag).show();
   $li.addClass(css);

   loadPhotoTag(selectedTag);

   $letters.find('li').click(function(this: HTMLElement) {
      $li.removeClass(css);
      $li = $(this);
      $li.addClass(css);

      $selector.hide();
      $selector = $('#' + $li.data('for'));
      $selector.show();

      const $options = $selector.find('option');

      if ($options.length == 2) {
         const tag = ($options[1] as HTMLOptionElement).value;
         $selector.val(tag);
         loadPhotoTag(tag);
      } else {
         $thumbs.empty();
         $status.html('Waiting for selection &hellip;');
      }
   });

   $selectors.on('change', 'select', function(
      this: HTMLElement,
      e: JQuery.Event
   ) {
      e.stopPropagation();
      e.preventDefault();

      const tag = $selector.val() as string;

      loadPhotoTag(tag);

      if (tag && tag != emptyTag) {
         window.history.pushState(
            null,
            `${siteName} photos tagged with "${tag}"`,
            `/photo-tag/${tag}`
         );
      }
   });

   /**
    * Load photo-search.hbs rendered by server.
    */
   function loadPhotoTag(tag: string) {
      if (tag && tag != emptyTag) {
         const url = `/photo-tag/search/${tag}`;

         $status.html('Retrieving images &hellip;');
         $thumbs.load(url, function(
            this: HTMLElement,
            _response: JQueryResponse,
            status: string
         ) {
            $status.empty();

            if (status === 'error') {
               $thumbs.empty();
               alert(
                  `Sorry about that. Looking for "${tag}" photos caused an error.`
               );
            }
            window.scrollTo(0, 0);
         });
      } else {
         $thumbs.empty();
         $status.empty();
      }
   }
});
