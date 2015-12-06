'use strict';

const config = require('../mock-config.js');
const Enum = require('../../lib/enum.js');
const mocha = require('mocha');
const expect = require('chai').expect;
const TagController = require('../../lib/controllers/tag-controller.js');
const MockRequest = require('../mock-request.js');
const MockResponse = require('../mock-response.js');

describe('Post Tag Controller', ()=> {
	let req = new MockRequest();
	let res = new MockResponse();

	it.skip('renders list of posts for tag');
	it.skip('renders menu to navigate tags');
});