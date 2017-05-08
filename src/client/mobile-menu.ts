/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts"/>
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>

$(function() {
   const $button = $('#mobile-menu-button');
   const $menu = $('#mobile-menu');
   const $categories = $menu.find('.categories');
   /**
    * Down button
    *
    *    TODO: needs to be material icon
    */
   const $down = $menu.find('.glyphicon-chevron-down');
   const tagHeight = $categories.height();
   const selection = loadMenuSelection('when');

   let prepared = false;
   let visible = false;

   $button.click(() => {
      if (visible) {
         $menu.hide(0, ()=> { visible = false; });
      } else {
         $menu.show(0, prepare);
      }
   });

   /**
    * Wire menu events
    */
   function prepare() {
      visible = true;
      if (prepared) { return; }

      const css = 'selected';
      const $categoryList = $menu.find('.category-list li');
      //const $down = $menu.find('.glyphicon-chevron-down');

      $menu.find('.close').click(()=> { $menu.hide(0, ()=> { visible = false; }); });

      // make initial selection
      $categories.find('ul.' + selection).show(0, toggleArrow);
      $categoryList.filter('li.' + selection).addClass(css);

      $categoryList.click(function(this:HTMLElement) {
         const $tag = $(this);
         const tagClass = $tag.attr('class');

         $down.hide();
         $categories.find('ul').hide();
         $categories.find('ul.' + tagClass).show(0, toggleArrow);
         $categoryList.removeClass(css);
         $tag.addClass(css);

         saveMenuSelection(tagClass);
      });

      prepared = true;
   }

   /**
    * Show down arrow if list of categories exceeds display area.
    */
   function toggleArrow(this:HTMLElement) {
      if ($(this).height() > tagHeight) {	$down.show(); }
   }

   /**
    * Load menu selection from browser storage.
    */
   function loadMenuSelection(ifNone:string):string {
      const match = util.setting.load('mobile');
      return (match === null) ? ifNone : match[1];
   }

   /**
    * Save menu selection to browser storage.
    */
   function saveMenuSelection(selected:string) {
      util.setting.save('mobile', selected);
   }
});