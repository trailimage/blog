var Enum = require('../enum.js');
var setting = require('../settings.js');
var format = require('../format.js');
var Recaptcha = require('recaptcha').Recaptcha;
var nodemailer = require('nodemailer');
/** @type {String} */
var key = 'contact';
var log = require('winston');

/**
 * Default route action
 * @param {req} req
 * @param {res} res
 */
exports.view = function(req, res)
{
	showForm(res);
};

exports.send = function(req, res)
{
	var data =
	{
		remoteip:  req.connection.remoteAddress,
		challenge: req.body.recaptcha_challenge_field,
		response:  req.body.recaptcha_response_field
	};
	var recaptcha = new Recaptcha(setting.reCaptcha.publicKey, setting.reCaptcha.privateKey, data);

	recaptcha.verify(function(success, error_code)
	{
		if (success) { sendMail(req, res); } else { showForm(res, 'Invalid CAPTCHA', recaptcha); }
	});
};

/**
 * @param res
 * @param {String} [error]
 * @param {Recaptcha} [recaptcha]
 * @see https://github.com/andris9/Nodemailer
 * @see http://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js
 * @see https://developers.google.com/recaptcha/docs/customization?csw=1
 */
function showForm(res, error, recaptcha)
{
	"use strict";

	if (recaptcha === undefined) { recaptcha = new Recaptcha(setting.reCaptcha.publicKey, setting.reCaptcha.privateKey); }

	res.render(key,
	{
		'title': format.icon('envelope') + 'Contact Me',
		'error': error,
		'captcha': recaptcha.toHTML()
	});
}

function sendMail(req, res)
{
	"use strict";

	var smtp = nodemailer.createTransport("SMTP",
	{
		service: "Gmail",
		auth: {
			user: setting.google.userID,
			pass: setting.google.password
		}
	});

	var email = req.body.senderEmail;
	var name = format.isEmpty(req.body.senderName) ? 'Anonymous' : req.body.senderName;
	var sender = format.isEmpty(email) ? name : format.string('{0} <{1}>', name, email);
	var options =
	{
		from: format.string('{0} <{1}>', 'Trail Image', setting.google.userID),
		to: setting.emailRecipient,
		subject: format.string('{0}: {1}', sender, req.body.subject),
		text: req.body.message
	};

	if (req.body.sendCopy == 'on' && Enum.pattern.email.test(email)) { options.cc = email; }

	smtp.sendMail(options, function(error, response)
	{
		if (error)
		{
			log.error(error);
		}
		else
		{
			log.info("Message sent from %s: %s", sender, response.message);
		}

		smtp.close();
		res.redirect('/');
	});
}