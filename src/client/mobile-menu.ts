/// <reference types="jquery" />
/// <reference path="../types/jquery/index.d.ts"/>
/// <reference path="./browser.d.ts"/>
/// <reference path="./util.ts"/>

$(function() {
   const $button = $("#mobile-menu-button");
   const $menu = $("#mobile-menu");
   const $categories = $menu.find(".categories");
   const $down = $menu.find(".material-icons.arrow_downward");
   let menuHeight = 0;
   // default root category
   const setting = util.setting.menuCategory;

   let selection = setting == null ? "when" : setting[0].toLocaleLowerCase();
   let prepared = false;
   let visible = false;

   if (selection.length < 4) { selection = "when"; }

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

      const css = "selected";
      const $categoryList = $menu.find(".category-list li");
      menuHeight = $menu.height();

      $menu.find(".close").click(()=> { $menu.hide(0, ()=> { visible = false; }); });

      // make initial selection
      $categories.find("ul." + selection).show(0, toggleArrow);
      $categoryList.filter("li." + selection).addClass(css);

      $categoryList.click(function(this:HTMLElement) {
         const $cat = $(this);
         const catClass = $cat.attr("class");

         $down.hide();
         $categories.find("ul").hide();
         $categories.find("ul." + catClass).show(0, toggleArrow);
         $categoryList.removeClass(css);
         $cat.addClass(css);

         util.setting.menuCategory = [catClass, null];
      });

      prepared = true;
   }

   /**
    * Show down arrow if list of categories exceeds display area.
    */
   function toggleArrow(this:HTMLElement) {
      if ($(this).height() > menuHeight) { $down.show(); } else { $down.hide(); }
   }
});