'use strict';

/**
 * Menu data are loaded in menu-script.hbs referenced as /js/menu-data.js only available on post pages
 */
$(function() {
   const css = 'selected';
   const $button = $('#post-menu-button');
   const $menu = $('#post-menu');
   const $rootList = $('#menu-roots');
   const $tagList = $('#menu-tags');
   const $postList = $('#menu-posts');
   const $description = $('#post-description');

   let selection = loadMenuSelection(['When', null]);

   $button
      .one('click', function() {
         // populate menu on first click
         for (const root in TrailImage.menu) {
            const $li = $('<li>').text(root);
            $rootList.append($li);
            if (root == selection[0]) { $li.addClass(css); loadTags(selection); }
         }
      })
      .click(toggleMenu);

   $rootList.on('click', 'li', function(this:Element, event:Event) {
      event.stopPropagation();
      const $li = $(this);
      selection = [$li.text(), null];
      menuSelect($rootList, $li, loadTags, selection);
   });

   $tagList.on('click', 'li', function(this:Element, event:Event) {
      event.stopPropagation();
      const $li = $(this);
      selection[1] = $li.text();
      menuSelect($tagList, $li, loadPosts, selection);
   });

   $postList
      .on('click', 'li.post', showSelection)
      .on('mouseover', 'li.post', function(this:Element) { $description.html($(this).data('description')); })
      .on('mouseout', function() { $description.empty(); });

   // always hide menu when clicking anywhere else on the screen
   $('html').click(function(event) { toggleMenu(event, true); });

   /**
    * Toggle menu visibility
    */
   function toggleMenu(event?:Event, forceHide?:boolean) {
      const $up = $button.find('.material-icons.expand_less');
      const $down = $button.find('.material-icons.expand_more');
      const show = function() { $button.addClass(css); $menu.show(); $up.show(); $down.hide(); };
      const hide = function() { $button.removeClass(css); $menu.hide(); $up.hide(); $down.show(); };

      if (event) { event.stopPropagation(); }

      if (forceHide === undefined) { forceHide = $button.hasClass(css); }
      if (forceHide) { hide(); } else { show(); }
   }

   function showSelection(this:Element) {
      const slug = $(this).data('slug');

      if (typeof loadPostTrack !== 'undefined') {
         loadPostTrack(slug);
      } else {
         window.location.href = '/' + slug;
      }
      toggleMenu();
   }

   function menuSelect($list:JQuery, $clicked:JQuery, loader:(selected:string[])=>void, selected:string[]) {
      $list.find('li').removeClass(css);
      loader(selected);
      $clicked.addClass(css);
      saveMenuSelection(selected);
   }

   function loadTags(selected:string[]) {
      /** @type {TrailImage.Tag[]} */
      const tags = TrailImage.menu[selected[0]];

      $tagList.empty();

      if (selected[1] == null) { selected[1] = tags[0].title; }

      for (let i = 0; i < tags.length; i++) {
         const $li = $('<li>').text(tags[i].title);
         $tagList.append($li);
         if (tags[i].title == selected[1]) { $li.addClass(css); loadPosts(selected); }
      }
   }

   function loadPosts(selected:string[]) {
      /** @type {TrailImage.Tag[]} */
      const tags = TrailImage.menu[selected[0]];

      // reset list of posts in third column
      $postList.empty();

      for (let i = 0; i < tags.length; i++) {
         if (tags[i].title == selected[1]) {
            const ids = tags[i].posts;

            for (let j = 0; j < ids.length; j++) {
               let post = TrailImage.post[ids[j]];
               let title = post.title;

               if (post.part && j < (ids.length - 1) && title == TrailImage.post[ids[j + 1]].title) {
                  // found part in series followed by at least one more part in the same series
                  const $ol = $('<ol>');

                  while (j < ids.length && TrailImage.post[ids[j]].title == title) {
                     post = TrailImage.post[ids[j]];

                     $ol.prepend($('<li>')
                        .addClass('post')
                        .attr('value', post.part)
                        .html(post.subTitle)
                        .data('description', post.description)
                        .data('slug', post.slug));

                     j++;
                  }

                  j--;

                  post = TrailImage.post[ids[j]];

                  $postList.append($('<li>')
                     .addClass('series')
                     .html('<span class="mode-icon ' + post.icon + '"></span>' + post.title)
                     .append($ol));
               } else {
                  // if series part is orphaned within a tag then show full title
                  if (post.part) { title += ': ' + post.subTitle; }

                  $postList.append($('<li>')
                     .addClass('post')
                     .html('<span class="mode-icon ' + post.icon + '"></span>' + title)
                     .data('description', post.description)
                     .data('slug', post.slug));
               }
            }
         }
      }
   }

   function loadMenuSelection(ifNone:string[]):string[] {
      const re = new RegExp('\\bmenu=([^;\\b]+)', 'gi');
      const match = re.exec(document.cookie);
      return (match === null) ? ifNone : match[1].split(',');
   }

   /**
    * Menu root and tag selection
    */
   function saveMenuSelection(selected:string|string[]) {
      if (typeof selected === 'string') { selected = [selected, null]; }
      document.cookie = 'menu=' + selected.join();
   }
});