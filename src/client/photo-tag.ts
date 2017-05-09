/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts"/>
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>

/**
 * Defined in /views/photo-tag.hbs
 */
declare const selectedTag:string;
declare const siteName:string;

$(function() {
   const eventCategory = 'Photo Tag';
   const css = 'selected';
   const $view = $('#photo-tag');
   const id = 'item-' + selectedTag.substr(0, 1).toLowerCase();
   let $list = $view.find('#' + id);
   let $link = $list.find('#link-' + selectedTag);
   let $li = $view.find('li[data-for=' + id + ']');

   $list.show();
   $link.addClass(css);
   $li.addClass(css);

   loadPhotoTag($link);

   $view.find('li').click(function(this:HTMLElement) {
      $li.removeClass(css);
      $li = $(this);
      $li.addClass(css);

      $list.hide();
      $list = $('#'+ $li.data('for'));
      $list.show();

      util.log.event(eventCategory, 'Click Index Letter');
   });

   $view.find('#tag-index a').click(function(this:HTMLElement, e) {
      e.stopPropagation();
      e.preventDefault();
      $link.removeClass(css);
      $link = $(this);
      $link.addClass(css);

      loadPhotoTag($link);

      util.log.event(eventCategory, 'Click Name');

      window.history.pushState(
         null,
         siteName + ' photos tagged with "' + $link.html() + '"',
         $link.attr('href').replace('/search', '')
      );
   });

   /**
    * Load photo tag HTML
    */
   function loadPhotoTag($link:JQuery) {
      if ($link.length > 0) {
         $('#wait').show();
         $('#thumbs').load($link.attr('href'), function(this:HTMLElement, response:JQueryResponse, status:string) {
            if (status === 'error') {
               $(this).empty();
               $link.removeClass(css);
               util.log.event(eventCategory, 'Load Photos Error', 'Error');
               alert('Sorry about that. Looking for "' + $link.html() + '" photos caused an error.');
            }
            $('#wait').hide();
            window.scrollTo(0, 0);
         });
      }
   }
});