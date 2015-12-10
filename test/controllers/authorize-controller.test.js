'use strict';

const TI = require('../');
const config = TI.config;
const Enum = TI.enum;
const mocha = require('mocha');
const expect = require('chai').expect;
const AuthController = TI.Controller.Auth;

describe('Authorization Controller', ()=> {
	let req = new TI.Mock.Request();
	let res = new TI.Mock.Response();

	it.skip('renews Google access token');
});