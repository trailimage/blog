'use strict';

const TI = require('../');
const config = TI.config;
const Enum = TI.enum;
const mocha = require('mocha');
const expect = require('chai').expect;
const MapController = TI.Controller.map;

describe('Map Controller', ()=> {
	let req = new TI.Mock.Request();
	let res = new TI.Mock.Response();

	it.skip('downloads GPX file');
});