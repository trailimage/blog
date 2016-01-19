'use strict';

const TI = require('../');
const config = TI.Blog;
const Enum = TI.enum;
const mocha = require('mocha');
const expect = require('chai').expect;
const TagController = TI.Controller.tag;

describe('Post Tag Controller', ()=> {
	let req = new TI.Mock.Request();
	let res = new TI.Mock.Response();

	it.skip('renders list of posts for tag');
	it.skip('renders menu to navigate tags');
});