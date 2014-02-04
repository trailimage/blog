"use strict";

var Enum = require('./enum.js');
var Setting = require('./settings.js');

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
	if (Setting.isProduction) { d.setHours(d.getHours() - 6); }

	return exports.string('{0}/{1} {2} {3}:{4}:{5}.{6}',
		d.getMonth() + 1,
		d.getDate(),
		Enum.weekday[d.getDay()],
		hourOfDay(d.getHours()),
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
 * @param {int} h
 */
function hourOfDay(h) { return (h > 12) ? 'PM ' + (h - 12) : 'AM ' + h; }

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
	"use strict";

	for (var i = 0; i < arguments.length - 1; i++)
	{
		text = text.replace('{' + i + '}', arguments[i + 1]);
	}
	return text;
};

/**
 * Replace number with word
 * @param {int} n
 * @param {bool} [capitalize]
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
	"use strict";

	return (text != null) ? text.substr(0,1).toUpperCase() + text.substr(1).toLowerCase() : null;
};

/**
 * Convert text to date object
 * @param {String} text
 * @return {Date}
 */
exports.parseDate = function(text)
{
	"use strict";

	// e.g. '2012-06-17 17:34:33'
	// new Date(year, month, day, hours, minutes, seconds, milliseconds);
	var parts = text.split(' ');
	var date = parts[0].split('-');
	var time = parts[1].split(':');
	return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
};

/**
 * @param {Number|String} timestamp
 * @example 1370806601
 * @return {Date}
 * @see http://www.flickr.com/services/api/misc.dates.html
 */
exports.parseTimeStamp = function(timestamp)
{
	return new Date(timestamp * 1000);
};

/**
 * @param {Number|String} timestamp
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
	"use strict";

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
	"use strict";

	return (exports.isEmpty(text)) ? null : text
		.replace(/(\w)'/g, '$1&rsquo;')
		.replace(/\b'(\w)/g, '&lsquo;$1')
		.replace(/(\w)("|&quot;)/g, '$1&rdquo;')
		.replace(/("|&quot;)(\w)/g, '&ldquo;$2')
		.replace(/(<a [^>]+>)([^<]+)<\/a>/gi, function(match, tag, url)
		{
			// restore links injected by FlickrAPI
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
	"use strict";

	if (!exports.isEmpty(text))
	{
		var haiku = Enum.pattern.haiku;
		var poetry = Enum.pattern.allPoem;
		var allHaiku = Enum.pattern.allHaiku;

		if (poetry.test(text))
		{
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
			text = exports.paragraph(text);
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
		+ exports.paragraph(text.replace(match[0], ''));

	regex.lastIndex = 0;

	return text;
};

/**
 * Convert new lines to HTML paragraphs and normalize links
 * @param {String} text Plain text
 * @return {String} HTML formatted text
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/replace
 */
exports.paragraph = function(text)
{
	"use strict";

	if (!exports.isEmpty(text))
	{
		var ph = '[POEM]';
		var poem = '';

		text = exports.fixFlickr(text);

		text = text.replace(Enum.pattern.poetry, function(match, p1, p2)
		{
			poem += exports.poem(p1);
			return ph;
		});

		text = text.replace(Enum.pattern.blockQuote, function(match, p1, p2)
		{
			return '[Q]' + p1.replace(/[“”]/g, '') + '[/Q]\n\r';
		});

		text = '<p>' + this.text(text) + '</p>';

		text = text
			.replace(Enum.pattern.link, function(match, url)
			{
				return '<a href="' + url + '">' + url.split('/')[2] + '/&hellip;</a>';
			})
			.replace(Enum.pattern.newLine, '</p><p>')
			.replace(Enum.pattern.footnotes, function(match, p1, p2, p3)
			{
				// poems replace the first paragraph tag with a poem placeholder (ph)
				var footnotes = '';
				var prefix = '';

				if (p3.indexOf(ph) == 0)
				{
					p3 = p3.replace(ph, '<p>');
					prefix = ph;
				}

				return prefix + '<div class="footnotes">' + p3
					.replace(/[\*]\s*/g, '<sup class="title">*</sup>')
					.replace(/[¹]\s*/g, '<sup>1.</sup>')
					.replace(/[²]\s*/g, '<sup>2.</sup>')
					.replace(/[³]\s*/g, '<sup>3.</sup>')
					.replace(/[⁴]\s*/g, '<sup>4.</sup>')
					.replace(/[⁵]\s*/g, '<sup>5.</sup>')
					.replace(/[⁶]\s*/g, '<sup>6.</sup>')
					.replace(/[⁷]\s*/g, '<sup>7.</sup>') + exports.icon('book') + '</div>';
			})
			.replace(Enum.pattern.superscript, '<sup>$1</sup>')
			.replace(/(<p>)?\[Q\]/g, '<blockquote><p>')
			.replace(/\[\/Q\](<\/p>)?/g, '</p></blockquote>');

		if (poem.length > 0)
		{
			//console.log(text);
			text = text.replace(ph, '</p>' + poem + '<p class="first">');
		}

		return text;
	}
	return '';
};

/**
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

	if (/^\s*["“]/g.test(p) && /["”]\s*[¹²³⁴⁵⁶⁷]?\s*$/g.test(p))
	{
		p = p.replace(/["“”]/g, '');
		tag = 'blockquote';
	}

	p = p.replace(Enum.pattern.superscript, '<sup>$1</sup>');

	return '<' + tag + ' class="poem">' + p + '</' + tag + '>';
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
 * @param {String} text
 * @example Newsletter, No. 2: <a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20" rel="nofollow">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20</a>(4-2011%20Issue%202).pdf
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
		var re = /https?:\/\//;
		var oldLink = text.substring(text.lastIndexOf('<a', index), text.indexOf('</a>', index) + 4);
		var newLink = oldLink.replace(Enum.pattern.link, function(match, p1, p2)
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
	"use strict";

	return text === null || text === undefined || text === "";
};