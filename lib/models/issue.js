"use strict";

var format = require('./../format.js');
var Enum = require('./../enum.js');

var schema = 'model';
var key = 'issues';

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
		db().replace(key, this.oldSlug, this.slug, this.documentID, callback);
	}
	else
	{
		db().add(key, this.slug, this.documentID, callback);
	}
};

Issue.prototype.remove = function(callback)
{
	db().remove(key, this.slug, callback);
};

exports.newSlug = 'New';

exports.fromRequest = function(req)
{
	var issue = new Issue();
	issue.oldSlug = req.query.oldSlug;
	issue.documentID = req.query.docID;
	issue.slug = req.query.slug;
	return issue;
};

exports.all = function(callback)
{
	db().getAll(key, callback);
};

exports.fromDB = function(slug)
{
	var issue = new Issue();
	issue.documentID = req.query.docID;
	issue.slug = req.query.slug;
	return issue;
};