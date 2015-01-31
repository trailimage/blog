"use strict";

var Enum = require('./enum.js');
var setting = require('./settings.js');

/**
 * Format date as Month Day, Year (March 15, 1973)
 * @param {Date} d Date to be formatted
 * @return {String}
 * @static
 */
exports.date = function(d)
{
	"use strict";

	return Enum.month[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
};

/**
 * @param {String} text UTC Date string to be formatted
 * @return {String}
 * @static
 */
exports.logTime = function(text)
{
	var d = new Date(text);
	//var logOffset = d.getTimezoneOffset();
	//var localOffset = (new Date()).getTimezoneOffset();

	// just be dumb for now
	if (setting.isProduction) { d.setHours(d.getHours() - 6); }

	return exports.string('{0}/{1} {2} {3}:{4}:{5}.{6}',
		d.getMonth() + 1,
		d.getDate(),
		Enum.weekday[d.getDay()],
		exports.hourOfDay(d.getHours()),
		exports.leadingZeros(d.getMinutes(), 2),
		exports.leadingZeros(d.getSeconds(), 2),
		exports.leadingZeros(d.getMilliseconds(), 3)
	);
};

/**
 * Format fractions within the text
 * @param {String} text
 * @return {String}
 * @static
 */
exports.fraction = function(text)
{
	return text.replace(/(\d+)\/(\d+)/, '<sup>$1</sup>&frasl;<sub>$2</sub>');
};

/**
 * Decode base 64 string
 * @param {String} text
 * @returns {string}
 * @see http://www.hacksparrow.com/base64-encoding-decoding-in-node-js.html
 */
exports.decodeBase64 = function(text)
{
	var b = new Buffer(text, 'base64');
	return b.toString();
};

exports.encodeBase64 = function(text)
{
	var b = new Buffer(text);
	return b.toString('base64');
};

/**
 * Encode or decode ROT13
 * @param {string} text
 * @returns {string}
 * @see http://stackoverflow.com/questions/617647/where-is-my-one-line-implementation-of-rot13-in-javascript-going-wrong
 */
exports.rot13 = function(text)
{
	return text.replace(/[a-zA-Z]/g, function(chr)
	{
		let start = chr <= 'Z' ? 65 : 97;
		return String.fromCharCode(start + (chr.charCodeAt(0) - start + 13) % 26);
	});
};

/**
 * Return AM or PM for the hour of the day
 * @param {int} h
 */
exports.hourOfDay = function(h) { return (h > 12) ? 'PM ' + (h - 12) : 'AM ' + h; };

/**
 * Pad integer with leading zeroes
 * @param {int} d
 * @param {int} count Total digits needed
 * @return {String}
 * @static
 */
exports.leadingZeros = function(d, count)
{
	var text = d.toString();
	while (text.length < count) { text = '0' + text; }
	return text;
};

/**
 * Replace placeholders with arbitrary arguments
 * @param {String} text
 * @return {String}
 */
exports.string = function(text)
{
	for (var i = 0; i < arguments.length - 1; i++)
	{
		text = text.replace('{' + i + '}', arguments[i + 1]);
	}
	return text;
};

/**
 *
 * @param {String} list Comma delimited tag list given with each photo
 * @return {String}
 */
exports.tagList = function(list)
{
	var links = '';
	var link = '<a href="/photo-tag/{0}">{1}</a>';

	if (list)
	{
		let tags = list.split(/\s*,\s*/).sort();

		for (let i = 0; i < tags.length; i++)
		{
			if (setting.removeTag.indexOf(tags[i]) == -1)
			{
				links += exports.string(link, tags[i].toLowerCase().replace(/\W/g, ''), tags[i]) + ' ';
			}
		}
	}
	return links;
};

/**
 * Replace number with word
 * @param {int} n
 * @param {Boolean} [capitalize]
 * @return string
 */
exports.sayNumber = function(n, capitalize)
{
	if (capitalize === undefined) { capitalize = true; }
	var word = n.toString();

	switch (n)
	{
		case 1: word = 'One'; break;
		case 2: word = 'Two'; break;
		case 3: word = 'Three'; break;
		case 4: word = 'Four'; break;
		case 5: word = 'Five'; break;
		case 6: word = 'Six'; break;
		case 7: word = 'Seven'; break;
		case 8: word = 'Eight'; break;
		case 9: word = 'Nine'; break;
		case 10: word = 'Ten'; break;
		case 11: word = 'Eleven'; break;
		case 12: word = 'Twelve'; break;
		case 13: word = 'Thirteen'; break;
		case 14: word = 'Fourteen'; break;
		case 15: word = 'Fifteen'; break;
		case 16: word = 'Sixteen'; break;
		case 17: word = 'Seventeen'; break;
		case 18: word = 'Eighteen'; break;
		case 19: word = 'Nineteen'; break;
		case 20: word = 'Twenty'; break;
	}

	return capitalize ? word : word.toLowerCase();
};

/**
 * @param {String} text
 * @return {String}
 */
exports.capitalize = function(text)
{
	return (text != null) ? text.substr(0,1).toUpperCase() + text.substr(1).toLowerCase() : null;
};

/**
 * Convert text to date object
 * @param {String} text
 * @return {Date}
 */
exports.parseDate = function(text)
{
	// e.g. '2012-06-17 17:34:33'
	// new Date(year, month, day, hours, minutes, seconds, milliseconds);
	var parts = text.split(' ');
	var date = parts[0].split('-');
	var time = parts[1].split(':');
	return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
};

/**
 * @param {Number|String|Date} timestamp
 * @example 1370806601
 * @return {Date}
 * @see http://www.flickr.com/services/api/misc.dates.html
 */
exports.parseTimeStamp = function(timestamp)
{
	return (timestamp instanceof Date) ? timestamp : new Date(timestamp * 1000);
};

/**
 * Obfuscate text as HTML character entities
 * @param {String} text
 * @see http://stackoverflow.com/questions/1354064/how-to-convert-characters-to-html-entities-using-plain-javascript
 */
exports.characterEntities = function(text)
{
	return text.replace(/[\u00A0-\u2666<>\&]/g, function(c)
	{
		return '&' + (Enum.htmlEntity[c.charCodeAt(0)] || '#' + c.charCodeAt(0)) + ';';
	});
};

/**
 * @param {Number|String|Date} timestamp
 * @example 1370806601
 * @return {String}
 * @example 2013-10-02T11:55Z
 * @see http://en.wikipedia.org/wiki/ISO_8601
 * @see https://developers.facebook.com/docs/reference/opengraph/object-type/article/
 */
exports.iso8601time = function(timestamp)
{
	var d = exports.parseTimeStamp(timestamp);

	return exports.string('{0}-{1}-{2}T{3}:{4}Z',
		d.getFullYear(),
		exports.leadingZeros(d.getMonth() + 1, 2),
		exports.leadingZeros(d.getDate(), 2),
		exports.leadingZeros(d.getHours(), 2),
		exports.leadingZeros(d.getMinutes(), 2));
};

/**
 * Convert decimal hours to hours:minutes
 * @param {Number} hours
 * @return {String}
 */
exports.hoursAndMinutes = function(hours)
{
	var h = Math.floor(hours);
	var m = hours - h;

	return h + ':' + exports.leadingZeros(Math.round(60 * m), 2);
};

/**
 * Make url slug
 * @param {String} text
 * @return {String}
 */
exports.slug = function(text)
{
	return (text != null) ? text.toLowerCase().replace(/\s/g, '-').replace(/[^\-a-z0-9]/g, '') : null;
};

/**
 * Remove non-numeric characters from string
 * @param {String} text
 * @return {Number}
 */
exports.parseNumber = function(text)
{
	text = (text ? text : '').replace(/[^\d\.]/g, '');
	return (exports.isEmpty(text)) ? NaN : parseFloat(text);
};

/**
 * Shuffle an array
 * @return {Array}
 * @see http://sroucheray.org/blog/2009/11/array-sort-should-not-be-used-to-shuffle-an-array/
 * @static
 */
exports.shuffle = function(a)
{
	var i = a.length, j, temp;
	if (i == 0) return null;
	while (--i)
	{
		j = Math.floor(Math.random() * (i + 1));
		temp = a[i];
		a[i] = a[j];
		a[j] = temp;
	}
	return a;
};

/**
 * Stylize punctuation
 * @param {String} text
 * @return {String}
 * @static
 */
exports.text = function(text)
{
	return (exports.isEmpty(text)) ? null : text
		.replace(/(\w)'/g, '$1&rsquo;')
		.replace(/\b'(\w)/g, '&lsquo;$1')
		.replace(/(\w)("|&quot;)/g, '$1&rdquo;')
		.replace(/("|&quot;)(\w)/g, '&ldquo;$2')
		.replace(/(<a [^>]+>)([^<]+)<\/a>/gi, function(match, tag, url)
		{
			// restore links injected by Flickr API
			return tag.replace(/(&ldquo;|&rdquo;)/g, '"') + url + '</a>';
		});
};

/**
 * @param {String} text
 * @return {String}
 * @static
 */
exports.story = function(text)
{
	if (!exports.isEmpty(text))
	{
		const haiku = Enum.pattern.haiku;
		const poetry = Enum.pattern.allPoem;
		const allHaiku = Enum.pattern.allHaiku;

		if (poetry.test(text))
		{
			// full poems have dash above and below
			text = text.replace(/(^|[\r\n])-([\r\n]|$)/g, '');

			if (allHaiku.test(text))
			{
				text = exports.haiku(text, allHaiku);
			}
			else
			{
				text = '<p class="poem">'
					+ text.replace(/\r*\n/gi, '<br/>').replace(/· · /g, '<span class="tab"></span>')
					+ '</p>';
			}
			poetry.lastIndex = 0;
		}
		else if (haiku.test(text))
		{
			text = exports.haiku(text, haiku);
		}
		else
		{
			text = exports.paragraphs(text);
		}
	}
	return text;
};

/**
 *
 * @param {String} text
 * @param {RegExp} regex
 */
exports.haiku = function(text, regex)
{
	regex.lastIndex = 0;

	var match = regex.exec(text);

	text = '<p class="haiku">'
		+ match[1] + '<br/>'
		+ match[2] + '<br/>'
		+ match[3] + exports.icon('leaf') + '</p>'
		+ exports.paragraphs(text.replace(match[0], ''));

	regex.lastIndex = 0;

	return text;
};

/**
 * Format poetry text
 * @param {String} text
 * @returns {string}
 */
exports.poem = function(text)
{
	var tag = 'p',
		p = text
			.replace(/[\r\n\s]*$/g, '')
			.replace(/\r*\n/gi, '<br/>')
			.replace(/· · /g, '<span class="tab"></span>');

	if (/^\s*["“]/g.test(p) && /["”]\s*[⁰¹²³⁴⁵⁶⁷⁸⁹]?\s*$/g.test(p))
	{
		p = p.replace(/["“”]/g, '');
		tag = 'blockquote';
	}

	p = p.replace(Enum.pattern.superscript, '$1<sup>$2</sup>');

	return '<' + tag + ' class="poem">' + p + '</' + tag + '>';
};

/**
 * Convert new lines to HTML paragraphs and normalize links
 * @param {String} text Plain text
 * @return {String} HTML formatted text
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/replace
 */
exports.paragraphs = function(text)
{
	if (!exports.isEmpty(text))
	{
		const ph = '[POEM]';  // poetry placeholder
		let poem = '';

		text = exports.fixFlickr(text);

		text = text.replace(Enum.pattern.poetry, function(match, c1, c2)
		{
			poem += exports.poem(c2);   // set poetry text aside
			return ph;                  // and replace with placeholder for now
		});

		text = text.replace(Enum.pattern.blockQuote, function(match, c1)
		{
			// remove quotes and wrap in fake tags that won't match subsequent operations
			return '[Q]' + c1.replace(/[“”]/g, '') + '[/Q]\n\r';
		});

		text = '<p>' + this.text(text) + '</p>';

		text = text
			.replace(Enum.pattern.link, function(match, url)
			{
				// shorten displayed URL to just the domain
				let parts = url.split('/');
				let domain = parts[2].replace('www.', '');
				let last = /\/$/.test(url) ? parts.length - 2 : parts.length - 1;
				let middle = '';
				let page = '';

				if (last > 2)
				{
					page = parts[last]
						.replace(/\?.+$/, '')           // parameters
						.replace(/#\w+$/, '')           // anchor tag
						.replace(/\.\w{2,4}$/, '');     // file extension
					middle = (last > 3) ? '/&hellip;/' : '/';
				}

				return '<a href="' + url + '">' + domain + middle + page + '</a>';
			})
			.replace(Enum.pattern.newLine, '</p><p>')
			.replace(Enum.pattern.footnotes, function(match, c1, c2, c3)
			{
				// poems replace the first paragraph tag with a poem placeholder (ph)
				let footnotes = '';
				let prefix = '';

				if (c3.indexOf(ph) == 0)
				{
					c3 = c3.replace(ph, '<p>');
					prefix = ph;
				}

				return prefix + '<div class="footnotes">' + c3
					.replace(/[\*]\s*/g, '<sup class="title">*</sup>')
					.replace(/[¹]\s*/g, '<sup>1.</sup>')
					.replace(/[²]\s*/g, '<sup>2.</sup>')
					.replace(/[³]\s*/g, '<sup>3.</sup>')
					.replace(/[⁴]\s*/g, '<sup>4.</sup>')
					.replace(/[⁵]\s*/g, '<sup>5.</sup>')
					.replace(/[⁶]\s*/g, '<sup>6.</sup>')
					.replace(/[⁷]\s*/g, '<sup>7.</sup>')
					.replace(/[⁸]\s*/g, '<sup>8.</sup>')
					.replace(/[⁹]\s*/g, '<sup>9.</sup>') + exports.icon('book') + '</div>';
			})
			.replace(Enum.pattern.superscript, '$1<sup>$2</sup>')
			.replace(/(<p>)?\[Q\]/g, '<blockquote><p>')             // replace temporary blockquote tags with HTML
			.replace(/\[\/Q\](<\/p>)?/g, '</p></blockquote>');

		if (poem.length > 0)
		{
			text = text.replace(ph, '</p>' + poem + '<p class="first">');
		}

		return text;
	}
	return '';
};

/**
 * @param {string} name
 * @returns {string}
 * @see http://getbootstrap.com/components/
 */
exports.icon = function(name)
{
	return '<span class="glyphicon glyphicon-' + name + '"></span>';
};

/**
 * Flickr sometimes messes up URLs have parenthesis within them
 * @param {String} text
 * @example Newsletter, No. 2: <a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20" rel="nofollow">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20</a>(4-2011%20Issue%202).pdf
 * @example <a href="http://www.idahogeology.org/PDF/Technical_Reports_" rel="nofollow">www.idahogeology.org/PDF/Technical_Reports_</a>(T)/TR-81-1.pdf
 * @return {String}
 */
exports.fixFlickr = function(text)
{
	var index = 0;

	text = text.replace(Enum.pattern.badLinkTag, function(match, part, i)
	{
		index = i;
		return part + '</a>';
	});

	if (index > 0)
	{
		let re = /https?:\/\//;
		let oldLink = text.substring(text.lastIndexOf('<a', index), text.indexOf('</a>', index) + 4);
		let newLink = oldLink.replace(Enum.pattern.link, function(match, p1, p2)
		{
			if (!re.test(p2)) { p2 = 'http://' + p2; }
			return exports.string('<a href="{0}">{1}</a>', p2, p1.replace(re, ''));
		});
		text = text.replace(oldLink, newLink);
	}
	return text;
};

/**
 * Check if text is any kind of empty
 * @param {String} text
 * @return {Boolean}
 * @static
 */
exports.isEmpty = function(text)
{
	return text === null || text === undefined || text === "";
};