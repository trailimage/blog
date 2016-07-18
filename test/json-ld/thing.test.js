'use strict';

const Schema = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Thing', ()=> {
	const contextField = '@context';
	const typeField = '@type';
	const idField = '@id';
	const schema = 'http://schema.org';

	it('serializes and simplifies the graph', ()=> {
		let thing = Schema.thing({ [typeField]: Schema.Type.action });
		let person = Schema.person({ name: 'Person Name' });
		let json = `{"${typeField}":"${Schema.Type.action}","${contextField}":"${schema}"}`;

		expect(thing.serialize()).equals(json);

		let cw = Schema.creativeWork({ author: person });
		let personJSON = `{"${typeField}":"${Schema.Type.person}","name":"${person.name}"}`;

		json = `{"${contextField}":"${schema}","${typeField}":"${Schema.Type.creativeWork}","author":${personJSON}}`;

		//expect(cw.serialize()).equals(json);
	});

	//it('is speedy', ()=> {
	//	let iterations = 100000;
	//	let start = new Date().getTime();
	//
	//	for (let i = 0; i < iterations; i++) {
	//		let x = require('mocha');
	//	}
	//
	//	console.log(new Date().getTime() - start);
	//
	//	start = new Date().getTime();
	//
	//	for (let i = 0; i < iterations; i++) {
	//		let x = load('mocha');
	//	}
	//
	//	console.log(new Date().getTime() - start);
	//});
});

//let modules = {};
//
//function load(name) {
//	if (modules[name] === undefined) { modules[name] = require(name); }
//	return modules[name];
//}