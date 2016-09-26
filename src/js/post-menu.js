'use strict';

/**
 * Menu data are loaded in menu-script.hbs referenced as /js/menu-data.js only available on post pages
 */
$(function() {
	var css = 'selected',
		$button = $('#post-menu-button'),
		$menu = $('#post-menu'),
		$rootList = $('#menu-roots'),
		$tagList = $('#menu-tags'),
		$postList = $('#menu-posts'),
		$description = $('#post-description'),
		selection = loadMenuSelection(['When', null]);

	$button
		.one('click', function() {
			// populate menu on first click
			for (var root in TrailImage.menu) {
				var $li = $('<li>').text(root);
				$rootList.append($li);
				if (root == selection[0]) { $li.addClass(css); loadTags(selection); }
			}
		})
		.click(toggleMenu);

	$rootList.on('click', 'li', function(event) {
		event.stopPropagation();
		var $li = $(this);
		selection = [$li.text(), null];
		menuSelect($rootList, $li, loadTags, selection);
	});

	$tagList.on('click', 'li', function(event) {
		event.stopPropagation();
		var $li = $(this);
		selection[1] = $li.text();
		menuSelect($tagList, $li, loadPosts, selection);
	});

	$postList
		.on('click', 'li.post', showSelection)
		.on('mouseover', 'li.post', function() { $description.html($(this).data('description')); })
		.on('mouseout', function() { $description.empty(); });

	// always hide menu when clicking anywhere else on the screen
	$('html').click(function(event) { toggleMenu(event, true); });

	/**
	 * @param {Object} [event]
	 * @param {Boolean} [forceHide] Optionally force hide otherwise detect from CSS
	 */
	function toggleMenu(event, forceHide) {
		// toggle menu visibility
		var $up = $button.find('.glyphicon-chevron-up');
		var $down = $button.find('.glyphicon-chevron-down');
		var show = function() { $button.addClass(css); $menu.show(); $up.show(); $down.hide(); };
		var hide = function() { $button.removeClass(css); $menu.hide(); $up.hide(); $down.show(); };

		if (event) { event.stopPropagation(); }

		if (forceHide === undefined) { forceHide = $button.hasClass(css); }
		if (forceHide) { hide(); } else { show(); }
	}

	function showSelection() {
		var slug = $(this).data('slug');

		if (typeof loadPostTrack !== 'undefined') {
			loadPostTrack(slug);
		} else {
			window.location.href = '/' + slug;
		}
		toggleMenu();
	}

	/**
	 * @param {jQuery} $list
	 * @param {jQuery} $clicked
	 * @param {function(string[])} loader
	 * @param {String[]} selected
	 */
	function menuSelect($list, $clicked, loader, selected) {
		$list.find('li').removeClass(css);
		loader(selected);
		$clicked.addClass(css);
		saveMenuSelection(selected);
	}

	/**
	 * @param {String[]} selected
	 */
	function loadTags(selected) {
		/** @type {TrailImage.Tag[]} */
		var tags = TrailImage.menu[selected[0]];

		$tagList.empty();

		if (selected[1] == null) { selected[1] = tags[0].title; }

		for (var i = 0; i < tags.length; i++) {
			var $li = $('<li>').text(tags[i].title);
			$tagList.append($li);
			if (tags[i].title == selected[1]) { $li.addClass(css); loadPosts(selected); }
		}
	}

	/**
	 * @param {String[]} selected
	 */
	function loadPosts(selected) {
		/** @type {TrailImage.Tag[]} */
		var tags = TrailImage.menu[selected[0]];

		// reset list of posts in third column
		$postList.empty();

		for (var i = 0; i < tags.length; i++) {
			if (tags[i].title == selected[1]) {
				var ids = tags[i].posts;

				for (var j = 0; j < ids.length; j++) {
					var post = TrailImage.post[ids[j]];
					var title = post.title;

					if (post.part && j < (ids.length - 1) && title == TrailImage.post[ids[j + 1]].title) {
						// found part in series followed by at least one more part in the same series
						var $ol = $('<ol>');

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

	/**
	 * @param {String[]} ifNone Root and post tags to load if no cookie is found
	 * @returns {String[]}
	 */
	function loadMenuSelection(ifNone) {
		var re = new RegExp('\\bmenu=([^;\\b]+)', 'gi');
		var match = re.exec(document.cookie);
		return (match === null) ? ifNone : match[1].split(',');
	}

	/**
	 * Menu root and tag selection
	 * @param {String|String[]} selected
	 */
	function saveMenuSelection(selected) {
		if (typeof selected === 'string') { selected = [selected, null]; }
		document.cookie = 'menu=' + selected.join();
	}
});