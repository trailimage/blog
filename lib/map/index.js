'use strict';

class MapIndex {
	static get Base() { return require('./geo-base.js'); }
	static get Coordinates() { return require('./geo-coordinates.js'); }
	static get Feature() { return require('./geo-feature.js'); }
	static get FeatureList() { return require('./geo-feature-list.js'); }
	static get Point() { return require('./geo-point.js'); }
	static get Route() { return require('./geo-route.js'); }
	static get Track() { return require('./geo-track.js'); }
	static get Geometry() { return require('./geometry.js'); }
	static get Helper() { return require('./gpx-helper.js'); }
	static get Line() { return require('./gpx-line.js'); }
	static get Location() { return require('./gpx-location.js'); }
}

module.exports = MapIndex;