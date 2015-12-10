'use strict';

const lib = require('../');
const config = lib.config;
const Enum = lib.enum;
const mocha = require('mocha');
const expect = require('chai').expect;
const TagController = lib.Controller.tag;
const MockRequest = require('../mock-request.js');
const MockResponse = require('../mock-response.js');

describe('Post Tag Controller', ()=> {
	let req = new MockRequest();
	let res = new MockResponse();

	it.skip('renders list of posts for tag');
	it.skip('renders menu to navigate tags');
});