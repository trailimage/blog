'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const Image = require('../../../lib/pdf/elements/image-element.js');

describe('PDF Image Element', ()=> {
	it('returns RGB and A values separately from set RGBA colors', ()=> {
		/*
		┌─────────────────────────┐
		│                         │
		│   ╔═════════════════╗   │
		│   ║                 ║   │
		│   ║                 ║   │  ►
		│   ║ element         ║   │
		│   ╚═════════════════╝   │
		│ area                    │
		└─────────────────────────┘
		*/
		/*         20
		╔═════╗───────────────┐            ╔══════════╗──────────┐
		║     ║               │            ║          ║          │
		║     ║ 10            │            ║          ║          │
		║     ║               │            ║          ║          │
		║     ║               │ 20   ►     ║          ║ 20       │
		╚═════╝               │            ║          ║          │
		│  5                  │            ║          ║          │
		│                     │            ║    10    ║          │
		└─────────────────────┘            ╚══════════╝──────────┘
		*/



	});
});