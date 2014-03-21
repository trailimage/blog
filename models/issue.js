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
Issue.prototype.originalSlug = null;
Issue.prototype.save = function(callback)
{
	if (this.originalSlug != exports.newSlug && this.originalSlug != this.slug)
	{
		// delete old key before inserting new
	}
	else
	{
		db().add(Enum.key.issues, this.slug, this.documentID, callback);
	}
};

Issue.prototype.remove = function(callback)
{
	db().remove(Enum.key.issues, this.slug, callback);
};

exports.key = 'issues';
exports.newSlug = 'New';

exports.fromRequest = function(req)
{
	var issue = new Issue();
	issue.originalSlug = req.query.originalSlug;
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