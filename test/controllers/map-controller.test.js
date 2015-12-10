'use strict';

const lib = require('../');
const config = lib.config;
const Enum = lib.enum;
const mocha = require('mocha');
const expect = require('chai').expect;
const MapController = lib.Controller.map;
const MockRequest = require('../mock-request.js');
const MockResponse = require('../mock-response.js');

describe('Map Controller', ()=> {
	let req = new MockRequest();
	let res = new MockResponse();

	it.skip('downloads GPX file');
});