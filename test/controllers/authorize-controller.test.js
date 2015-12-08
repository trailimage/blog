'use strict';

const config = require('../mock-config.js');
const Enum = require('../../lib/enum.js');
const mocha = require('mocha');
const expect = require('chai').expect;
const AuthController = require('../../lib/controllers/authorize-controller.js');
const MockRequest = require('../mock-request.js');
const MockResponse = require('../mock-response.js');

describe('Authorization Controller', ()=> {
	let req = new MockRequest();
	let res = new MockResponse();

	it.skip('renews Google access token');
});