/// <reference types="jquery" />

'use strict';

$(function() {
   const css = 'selected';
   const $view = $('#photo-tag');
   const id = 'item-' + selectedTag.substr(0, 1).toLowerCase();
   const $list = $view.find('#' + id);
   const $link = $list.find('#link-' + selectedTag);
   const $li = $view.find('li[data-for=' + id + ']');

   $list.show();
   $link.addClass(css);
   $li.addClass(css);

   loadPhotoTag($link);

   $view.find('li').click(function() {
      $li.removeClass(css);
      $li = $(this);
      $li.addClass(css);

      $list.hide();
      $list = $('#'+ $li.data('for'));
      $list.show();
   });

   $view.find('#tag-index a').click(function(e) {
      e.stopPropagation();
      e.preventDefault();
      $link.removeClass(css);
      $link = $(this);
      $link.addClass(css);

      loadPhotoTag($link);

      window.history.pushState(
         null,
         siteName + ' photos tagged with "' + $link.html() + '"',
         $link.attr('href').replace('/search', '')
      );
   });

   function loadPhotoTag($link:JQuery) {
      if ($link.length > 0) {
         $('#wait').show();
         $('#thumbs').load($link.attr('href'), (response, status) => {
            if (status === 'error') {
               $(this).empty();
               $link.removeClass(css);
               alert('Sorry about that. Looking for "' + $link.html() + '" photos caused an error.');
            }
            $('#wait').hide();
            window.scrollTo(0, 0);
         });
      }
   }
});