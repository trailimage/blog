'use strict';

const TI = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('JSON-LD Thing', ()=> {
	const contextField = '@context';
	const typeField = '@type';
	const idField = '@id';
	const schema = 'http://schema.org';

	it('serializes and simplifies the graph', ()=> {
		let thing = new TI.LinkData.Thing(TI.LinkData.Type.action);
		let person = new TI.LinkData.Person();
		let json = `{"${contextField}":"${schema}","${typeField}":"${TI.LinkData.Type.action}"}`;

		expect(thing.serialize()).equals(json);

		person.name = 'Person Name';

		let cw = new TI.LinkData.CreativeWork();
		let personJSON = `{"${typeField}":"${TI.LinkData.Type.person}","name":"${person.name}"}`;

		cw.author = person;
		json = `{"${contextField}":"${schema}","${typeField}":"${TI.LinkData.Type.creativeWork}","author":${personJSON}}`;

		expect(cw.serialize()).equals(json);
	});
});