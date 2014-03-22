"use strict";

var format = require('./../format.js');
var Enum = require('./../enum.js');

function db() { return require('../adapters/hash.js'); }

/**
 * @constructor
 */
function Issue() {}

Issue.prototype.documentID = null;
Issue.prototype.slug = null;
Issue.prototype.oldSlug = null;
Issue.prototype.save = function(callback)
{
	if (this.oldSlug != exports.newSlug && this.oldSlug != this.slug)
	{
		db().replace(exports.key, this.oldSlug, this.slug, this.documentID, callback);
	}
	else
	{
		db().add(exports.key, this.slug, this.documentID, callback);
	}
};

Issue.prototype.remove = function(callback)
{
	db().remove(exports.key, this.slug, callback);
};

exports.key = 'issues';
exports.newSlug = 'New';

exports.fromRequest = function(req)
{
	var issue = new Issue();
	issue.oldSlug = req.query.oldSlug;
	issue.documentID = req.query.docID;
	issue.slug = req.query.slug;
	return issue;
};

exports.allFromDB = function(callback)
{
	db().getAll(exports.key, callback);
};

exports.fromDB = function(slug)
{
	var issue = new Issue();
	issue.documentID = req.query.docID;
	issue.slug = req.query.slug;
	return issue;
};