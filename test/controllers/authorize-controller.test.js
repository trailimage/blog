'use strict';

const lib = require('../');
const config = lib.config;
const Enum = lib.enum;
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