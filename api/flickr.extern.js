/**
 * @fileoverview Externs for Flickr
 * @see http://www.flickr.com/services/api/
 * @externs
 */

/**
 * @type {Object}
 */
var Flickr = {
	/**
	 * @enum {String}
	 */
	Media: {
		photo: 'photo',
		video: 'video'
	},

	/*
	 * @enum {String}
	 */
	ExifTag:	{
		Description: 'ImageDescription', /* Description: 'Description', */
		CameraMake: 'Make',
		CameraModel: 'Model',
		CameraSerialNumber: 'SerialNumber',
		Lens: 'Lens',
		LensInfo: 'LensInfo',
		LensModel: 'LensModel',
		ResolutionX: 'XResolution',
		ResolutionY: 'YResolution',
		ResolutionUnit: 'ResolutionUnit',
		DisplayedUnitsX: 'DisplayedUnitsX',
		DisplayedUnitsY: 'DisplayedUnitsY',
		Software: 'Software',
		ApplicationRecordVersion: 'ApplicationRecordVersion',
		DateCreated: 'CreateDate',
		DateModified: 'ModifyDate',
		DateOriginal: 'DateTimeOriginal',
		TimeCreated: 'TimeCreated',
		MetadataDate: 'MetadataDate',
		DigitalCreationDate: 'DigitalCreationDate',
		DigitalCreationTime: 'DigitalCreationTime',
		SubSecTimeOriginal: 'SubSecTimeOriginal',
		SubSecTimeDigitized: 'SubSecTimeDigitized',
		Artist: 'Artist',
		ByLine: 'By-line',
		Creator: 'Creator',
		Copyright: 'Copyright',
		CopyrightFlag: 'CopyrightFlag',
		CopyrightNotice: 'CopyrightNotice',
		Rights: 'Rights',
		Marked: 'Marked',
		Title: 'Title',
		Subject: 'Subject',
		CaptionAbstract: 'Caption-Abstract',
		ExposureTime: 'ExposureTime',
		ExposureMode: 'ExposureMode',
		ExposureProgram: 'ExposureProgram',
		ExposureCompensation: 'ExposureCompensation',
		WhiteBalance: 'WhiteBalance',
		FocalLength: 'FocalLength',
		FocalLengthIn35mmFormat: 'FocalLengthIn35mmFormat',
		ApproximateFocusDistance: 'ApproximateFocusDistance',
		Aperture: 'FNumber',
		MaxAperture: 'MaxApertureValue',
		ISO: 'ISO',
		MeteringMode: 'MeteringMode',
		SensitivityType: 'SensitivityType',
		SensingMethod: 'SensingMethod',
		ExifVersion: 'ExifVersion',
		XmpToolkit: 'XMPToolkit',
		LightSource: 'LightSource',
		Flash: 'Flash',
		FileSource: 'FileSource',
		SceneType: 'SceneType',
		SceneCaptureType: 'SceneCaptureType',
		CustomRendered: 'CustomRendered',
		DigitalZoomRatio: 'DigitalZoomRatio',
		GainControl: 'GainControl',
		Contrast: 'Contrast',
		Saturation: 'Saturation',
		Sharpness: 'Sharpness',
		ColorTransform: 'ColorTransform',
		Compression: 'Compression',
		Format: 'Format',
		SubjectDistance: 'SubjectDistanceRange',
		GpsVersionID: 'GPSVersionID',
		GpsLatitudeRef: 'GPSLatitudeRef',
		GpsLatitude: 'GPSLatitude',
		GpsLongitudeRef: 'GPSLongitudeRef',
		GpsLongitude: 'GPSLongitude',
		ThumbnailOffset: 'ThumbnailOffset',
		ThumbnailLength: 'ThumbnailLength',
		PhotoshopThumbnail: 'PhotoshopThumbnail',
		IptcDigest: 'IPTCDigest',
		DctEncodeVersion: 'DCTEncodeVersion',
		ImageNumber: 'ImageNumber',
		DocumentID: 'DocumentID',
		OriginalDocumentID: 'OriginalDocumentID',
		DerivedFromDocumentID: 'DerivedFromDocumentID',
		DerivedFromOriginalDocumentID: 'DerivedFromOriginalDocumentID',
		InstanceID: 'InstanceID',
		CodedCharacterSet: 'CodedCharacterSet',
		ObjectName: 'ObjectName',
		Keywords: 'Keywords',
		City: 'City',
		Location: 'Location',
		SubLocation: 'Sub-location',
		State: 'Province-State',
		Country: 'Country-PrimaryLocationName',
		ViewingIlluminant: 'ViewingCondIlluminant',
		ViewingSurround: 'ViewingCondSurround',
		ViewingIlluminantType: 'ViewingCondIlluminantType',
		MeasurementObserver: 'MeasurementObserver',
		MeasurementBacking: 'MeasurementBacking',
		MeasurementGeometry: 'MeasurementGeometry',
		MeasurementFlare: 'MeasurementFlare',
		MeasurementIlluminant: 'MeasurementIlluminant',
		HistoryAction: 'HistoryAction',
		HistoryParameters: 'HistoryParameters',
		HistoryInstanceID: 'HistoryInstanceID',
		HistoryWhen: 'HistoryWhen',
		HistorySoftware: 'HistorySoftwareAgent',
		HistoryChanged: 'HistoryChanged'
	},


	/**
	 * @enum {Number}
	 */
	Boolean:	{
		'true': 1,
		'false': 0
	},

	/**
	 * @enum {String}
	 */
	Extra: {
		Description: 'description',
		Tags: 'tags',
		DateTaken: 'date_taken',
		Location: 'geo'
	},

	/**
	 * @type {String}
	 */
	Status: {
		ok: 'okay',
		fail: 'fail'
	},

	/**
	 * @enum {int}
	 * @see http://www.flickr.com/services/api/flickr.photos.licenses.getInfo.html
	 */
	License:	{
		AllRightsReserved: 0,
		Attribution: 4,
		Attribution_NoDervis: 6,
		Attribution_NonCommercial_NoDerivs: 3,
		Attribution_NonCommercial: 2,
		Attribution_NonCommercial_ShareAlike: 1,
		Attribution_ShareAlike: 4,
		NoKnownRestriction: 7,
		UnitedStatesGovernmentWork: 8
	},

	/**
	 * @enum {int}
	 * @see http://www.flickr.com/services/api/flickr.photos.setSafetyLevel.html
	 */
	SafetyLevel: {
		Safe: 1,
		Moderate: 2,
		Restricted: 3
	}
};

// API ------------------------------------------------------------------------

Flickr.prototype.API = {};

/**
 * @type {String}
 */
Flickr.API.prototype.api_key = null;

/**
 * @type {String}
 */
Flickr.API.prototype.format = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.API.prototype.nojsoncallback = 0;

/**
 * @type {String}
 */
Flickr.API.prototype.method = null;

/**
 * Comma-delimited list
 * @type {String}
 */
Flickr.API.prototype.extras = null;

/**
 * @type {String[]}
 */
Flickr.API.prototype.tags = [];

/**
 * @type {String}
 */
Flickr.API.prototype.sort = null;

/**
 * @type {Number}
 */
Flickr.API.prototype.per_page = null;

/**
 * @type {String}
 */
Flickr.API.prototype.photo_id = null;

// Tree -----------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.collections.getTree.html
 */
Flickr.prototype.Tree = {};

/**
 * @type {Flickr.Collection[]}
 */
Flickr.Tree.prototype.collection = [];

// Collection -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Collection = {};

/**
 * @type {String}
 */
Flickr.Collection.prototype.id = null;

/**
 * @type {String}
 */
Flickr.Collection.prototype.title = null;

/**
 * @type {String}
 */
Flickr.Collection.prototype.description = null;

/**
 * @type {String}
 */
Flickr.Collection.prototype.iconlarge = null;

/**
 * @type {String}
 */
Flickr.Collection.prototype.iconsmall = null;

/**
 * @type {Flickr.Collection[]}
 */
Flickr.Collection.prototype.collection = [];

/**
 * @type {Flickr.SetSummary[]}
 */
Flickr.Collection.prototype.set = [];

// SetSummary -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.SetSummary = null;

/**
 * @type {String}
 */
Flickr.SetSummary.prototype.id = null;

/**
 * @type {String}
 */
Flickr.SetSummary.prototype.title = null;

/**
 * @type {String}
 */
Flickr.SetSummary.prototype.description = null;

// Response -------------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Response = null;

/**
 * @type {Flickr.SetPhotos|Flickr.SetInfo}
 */
Flickr.Response.prototype.photoset = null;

/**
 * @type {Flickr.MemberSet[]}
 */
Flickr.Response.prototype.set = [];

/**
 * @type {Flickr.Tree}
 */
Flickr.Response.prototype.collections = null;

/**
 * @type {Flickr.PhotoInfo}
 */
Flickr.Response.prototype.photo = null;

/**
 * @type {Flickr.SizeList}
 */
Flickr.Response.prototype.sizes = null;

/**
 * @type {Flickr.Status}
 */
Flickr.Response.prototype.stat = null;

/**
 * @type {Integer}
 */
Flickr.Response.prototype.code = 0;


/**
 * @type {String}
 */
Flickr.Response.prototype.message = null;

/**
 * @type {Flickr.SearchResult}
 */
Flickr.Response.prototype.photos = null;

// Content --------------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Content = null;

/**
 * @type {String}
 */
Flickr.Content.prototype._content = null;

// Exif -----------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/explore/flickr.photos.getExif
 */
Flickr.prototype.PhotoExif = null;

/**
 * @type {Flickr.PhotoSummary}
 */
Flickr.PhotoExif.prototype.photo = null;

/**
 * @type {Flickr.Exif[]}
 */
Flickr.PhotoExif.photo.prototype.exif = [];

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/explore/flickr.photos.getExif
 */
Flickr.prototype.Exif = null;


/**
 * @type {Enum.ExifSpace}
 */
Flickr.Exif.prototype.tagspace = null;

/**
 * @type {Number}
 */
Flickr.Exif.prototype.tagspaceid = 0;

/**
 * @type {Flickr.ExifTag|String}
 */
Flickr.Exif.prototype.tag = null;

/**
 * @type {String}
 */
Flickr.Exif.prototype.label = null;

/**
 * @type {Flickr.Content}
 */
Flickr.Exif.prototype.raw = null;

// Size -----------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photos.getSizes.html
 */
Flickr.prototype.Size = null;

/**
 * @type {String}
 */
Flickr.Size.prototype.label = null;

/**
 * @type {int}
 */
Flickr.Size.prototype.width = 0;

/**
 * @type {int}
 */
Flickr.Size.prototype.height = 0;

/**
 * @type {String}
 */
Flickr.Size.prototype.source = null;

/**
 * @type {String}
 */
Flickr.Size.prototype.url = null;

/**
 * @type {Flickr.Media}
 */
Flickr.Size.prototype.media = null;

// SizeList ------------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Usage}
 * @see http://www.flickr.com/services/api/flickr.photos.getSizes.html
 */
Flickr.prototype.SizeList = null;

/**
 * @type {Flickr.Size[]}
 */
Flickr.SizeList.prototype.size = [];

// MemberSet ------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photos.getAllContexts.html
 */
Flickr.prototype.MemberSet = null;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.id = null;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.title = null;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.primary = null;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.secret = null;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.server = null;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.farm = 0;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.view_count = 0;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.comment_count = 0;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.count_photo = 0;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.count_video = 0;

// PhotoMembership ------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photos.getAllContexts.html
 */
Flickr.prototype.PhotoMembership = null;

/**
 * @type {Flickr.MemberSet[]}
 */
Flickr.PhotoMembership.prototype.set = [];

// URL ------------------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Content}
 */
Flickr.prototype.URL = null;

/**
 * @type {String}
 */
Flickr.URL.prototype.type = null;

// LocationPermission ---------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.LocationPermission = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.LocationPermission.prototype.ispublic = false;

/**
 * @type {Flickr.Boolean}
 */
Flickr.LocationPermission.prototype.iscontant = false;

/**
 * @type {Flickr.Boolean}
 */
Flickr.LocationPermission.prototype.isfriend = false;

/**
 * @type {Flickr.Boolean}
 */
Flickr.LocationPermission.prototype.isfamily = false;

// Place ----------------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Content}
 */
Flickr.prototype.Place = null;

/**
 * @type {String}
 */
Flickr.Place.prototype.place_id = null;

/**
 * @type {String}
 */
Flickr.Place.prototype.woeid = null;

// Location -------------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Place}
 */
Flickr.prototype.Location = null;

/**
 * @type {Number}
 */
Flickr.Location.prototype.latitude = 0;

/**
 * @type {Number}
 */
Flickr.Location.prototype.longitude = 0;

/**
 * @type {Number}
 */
Flickr.Location.prototype.accuracy = 0;

/**
 * @type {Number}
 */
Flickr.Location.prototype.context = 0;

/**
 * @type {Flickr.Place}
 */
Flickr.Location.prototype.county = null;

/**
 * @type {Flickr.Place}
 */
Flickr.Location.prototype.region = null;

/**
 * @type {Flickr.Place}
 */
Flickr.Location.prototype.country = null;

// TagSummary -----------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Content}
 */
Flickr.prototype.TagSummary = {};

/**
 * @type {String}
 */
Flickr.TagSummary.prototype.id = null;

/**
 * @type {String}
 */
Flickr.TagSummary.prototype.author = null;

/**
 * @type {String}
 */
Flickr.TagSummary.prototype.raw = null;

/**
 * @type {Number}
 */
Flickr.TagSummary.prototype.machine_tag = 0;

// Usage ----------------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Usage = {};

/**
 * @type {Flickr.Boolean}
 */
Flickr.Usage.prototype.candownload = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Usage.prototype.canblog = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Usage.prototype.canprint = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Usage.prototype.canshare = null;

// EditAbility ----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.EditAbility = {};

/**
 * @type {Flickr.Boolean}
 */
Flickr.EditAbility.prototype.cancomment = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.EditAbility.prototype.canaddmeta = null;

// Permission -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Permission = {};

/**
 * @type {Flickr.Boolean}
 */
Flickr.Permission.prototype.permcomment = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Permission.prototype.permmetadata = null;

// PhotoDates -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.PhotoDates = {};

/**
 * @type {String}
 */
Flickr.PhotoDates.prototype.posted = null;

/**
 * @type {String}
 */
Flickr.PhotoDates.prototype.taken = null;

/**
 * @type {Number}
 */
Flickr.PhotoDates.prototype.takengranularity = 0;

/**
 * @type {String}
 */
Flickr.PhotoDates.prototype.lastupdate = null;

// Visibility -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Visibility = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Visibility.prototype.ispublic = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Visibility.prototype.isfriend = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Visibility.prototype.isfamily = null;

// Owner ----------------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Owner = {};

/**
 * @type {String}
 */
Flickr.Owner.prototype.nsid = null;

/**
 * @type {String}
 */
Flickr.Owner.prototype.username = null;

/**
 * @type {String}
 */
Flickr.Owner.prototype.location = null;

/**
 * @type {String}
 */
Flickr.Owner.prototype.iconserver = null;

/**
 * @type {Number}
 */
Flickr.Owner.prototype.iconfarm = 0;

// Photo ----------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photos.getInfo.html
 */
Flickr.prototype.PhotoInfo = {};

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.id = null;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.secret = null;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.server = null;

/**
 * @type {Number}
 */
Flickr.PhotoInfo.prototype.farm = 0;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.dateuploaded = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.PhotoInfo.prototype.isfavorite = null;

/**
 * @type {Flickr.License}
 */
Flickr.PhotoInfo.prototype.license = null;

/**
 * @type {Flickr.SafetyLevel}
 */
Flickr.PhotoInfo.prototype.safetylevel = null;

/**
 * @type {Flickr.Boolean}
 */
Flickr.PhotoInfo.prototype.rotate = null;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.originalsecret = null;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.originalformat = null;

/**
 * @type {Flickr.Owner}
 */
Flickr.PhotoInfo.prototype.owner = null;

/**
 * @type {Flickr.Content}
 */
Flickr.PhotoInfo.prototype.title = null;

/**
 * @type {Flickr.Content}
 */
Flickr.PhotoInfo.prototype.description = null;

/**
 * @type {Flickr.Visibility}
 */
Flickr.PhotoInfo.prototype.visibility = null;

/**
 * @type {Flickr.PhotoDates}
 */
Flickr.PhotoInfo.prototype.dates = null;

/**
 * @type {Number}
 */
Flickr.PhotoInfo.prototype.views = null;

/**
 * @type {Flickr.Permission}
 */
Flickr.PhotoInfo.prototype.permissions = null;

/**
 * @type {Flickr.EditAbility}
 */
Flickr.PhotoInfo.prototype.editability = null;

/**
 * @type {Flickr.EditAbility}
 */
Flickr.PhotoInfo.prototype.publiceditability = null;

/**
 * @type {Flickr.Usage}
 */
Flickr.PhotoInfo.prototype.usage = null;

/**
 * @type {Object}
 */
Flickr.PhotoInfo.prototype.tags = {};

/**
 * @type {Flickr.TagSummary[]}
 */
Flickr.PhotoInfo.prototype.tags.tag = [];

/**
 * @type {Flickr.Location}
 */
Flickr.PhotoInfo.prototype.location = null;

/**
 * @type {Flickr.LocationPermission}
 */
Flickr.PhotoInfo.prototype.geoperms = null;

/**
 * @type {Media}
 */
Flickr.PhotoInfo.prototype.media = null;

/**
 * @type {Object}
 */
Flickr.PhotoInfo.prototype.urls = {};

/**
 * @type {Flickr.URL[]}
 */
Flickr.PhotoInfo.prototype.urls.url = [];


// PhotoSummary ---------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.PhotoSummary = {};

/**
 * @type {String}
 */
Flickr.PhotoSummary.prototype.id = null;

/**
 * @type {String}
 */
Flickr.PhotoSummary.prototype.secret = null;

/**
 * @type {String}
 */
Flickr.PhotoSummary.prototype.server = null;

/**
 * @type {Number}
 */
Flickr.PhotoSummary.prototype.farm = 0;

/**
 * @type {String}
 */
Flickr.PhotoSummary.prototype.title = null;

/**
 * @type {Flickr.Boolean|Boolean}
 */
Flickr.PhotoSummary.prototype.isprimary = null;

/**
 * Space delimited list of photo tags
 * @type {String}
 */
Flickr.PhotoSummary.prototype.tags = null;

/**
 * If passed "description" extra
 * @type {Flickr.Content}
 */
Flickr.PhotoSummary.prototype.description = null;


/**
 * If passed "date_taken" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.datetaken = null;

/**
 * MySQL datetime (if passed "date_taken" extra)
 * @type {String}
 * @see http://www.flickr.com/services/api/misc.dates.html
 */
Flickr.PhotoSummary.prototype.datetaken = null;

/**
 * If passed "date_taken" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.datetakengranularity = null;

/**
 * If passed "geo" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.latitude = null;

/**
 * If passed "geo" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.longitude = null;

/**
 * If passed "geo" extra
 * @type {Number}
 */
Flickr.PhotoSummary.prototype.accuracy = 0;

/**
 * If passed "geo" extra
 * @type {Number}
 */
Flickr.PhotoSummary.prototype.context = 0;

/**
 * If passed "geo" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.place_id = null;

/**
 * If passed "geo" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.woeid = null;

/**
 * If passed "geo" extra
 * @type {Flickr.Boolean|Boolean}
 */
Flickr.PhotoSummary.prototype.geo_is_family = null;

/**
 * If passed "geo" extra
 * @type {Flickr.Boolean|Boolean}
 */
Flickr.PhotoSummary.prototype.geo_is_friend = null;

/**
 * If passed "geo" extra
 * @type {Flickr.Boolean|Boolean}
 */
Flickr.PhotoSummary.prototype.geo_is_contact = null;


/**
 * If passed "geo" extra
 * @type {Flickr.Boolean|Boolean}
 */
Flickr.PhotoSummary.prototype.geo_is_public = null;

/**
 * Unix timestamp (if passed "last_update" extra)
 * @type {String}
 * @see http://www.flickr.com/services/api/misc.dates.html
 */
Flickr.PhotoSummary.prototype.lastupdate = null;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_s = null;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_s = null;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_s = null;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_s = null;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_s = null;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_s = null;

/**
 * If passed "url_h" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_h = null;

/**
 * If passed "url_h" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_h = null;

/**
 * If passed "url_h" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_h = null;

/**
 * If passed "url_k" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_k = null;

/**
 * If passed "url_k" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_k = null;

/**
 * If passed "url_k" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_k = null;

/**
 * If passed "url_l" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_l = null;

/**
 * If passed "url_l" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_l = null;

/**
 * If passed "url_l" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_l = null;

/**
 * If passed "url_m" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_m = null;

/**
 * If passed "url_m" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_m = null;

/**
 * If passed "url_m" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_m = null;

/**
 * If passed "url_o" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_o = null;

/**
 * If passed "url_o" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_o = null;

/**
 * If passed "url_o" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_o = null;


// PhotoSetPhotos -------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
 */
Flickr.prototype.SetPhotos = {};

/**
 * @type {Flickr.SetInfo}
 */
Flickr.SetPhotos.prototype.photoset = null;

/**
 * @type {Flickr.PhotoSummary[]}
 */
Flickr.SetPhotos.prototype.photo = null;

/**
 * @type {Number}
 */
Flickr.SetPhotos.prototype.page = 0;

/**
 * @type {String}
 */
Flickr.SetPhotos.prototype.per_page = null;

/**
 * @type {String}
 */
Flickr.SetPhotos.prototype.perpage = null;

/**
 * @type {Number}
 */
Flickr.SetPhotos.prototype.pages = 0;

/**
 * @type {String}
 */
Flickr.SetPhotos.prototype.primary = null;

/**
 * @type {String}
 */
Flickr.SetPhotos.prototype.owner = null;

/**
 * @type {String}
 */
Flickr.SetPhotos.prototype.ownername = null;

/**
 * @type {String}
 */
Flickr.SetPhotos.prototype.title = null;

/**
 * @type {Number}
 */
Flickr.SetPhotos.prototype.total = 0;


// PhotoSetInfo ---------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photosets.getInfo.html
 */
Flickr.prototype.SetInfo = null;

/**
 * @type {Flickr.Content}
 */
Flickr.SetInfo.prototype.title = null;

/**
 * @type {Flickr.Content}
 */
Flickr.SetInfo.prototype.description = null;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.id = null;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.owner = null;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.username = null;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.primary = null;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.secret = null;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.server = null;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.farm = 0;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.photos = 0;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.count_views = 0;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.count_comments = 0;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.count_photos = 0;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.count_videos = 0;

/**
 * @type {Flickr.Boolean}
 */
Flickr.SetInfo.prototype.can_comment = 0;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.date_create = 0;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.date_update = 0;

// TagInfo --------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/explore/flickr.tags.getListUserRaw
 */
Flickr.TagInfo = {};

/**
 * @type {Object}
 */
Flickr.Response.prototype.who = {};

/**
 * @type {Flickr.Tag[]}
 */
Flickr.Response.Who.prototype.tags = [];

/**
 * @type {Object}
 */
Flickr.Tag = {};

/**
 * @type {String}
 */
Flickr.Tag.prototype.clean = null;

/**
 * @type {Flickr.Content[]}
 */
Flickr.Tag.prototype.raw = [];

// Search Results -------------------------------------------------------------

Flickr.SearchResult = {};

/**
 * @type {Integer}
 */
Flickr.SearchResult.prototype.page = 0;

/**
 * @type {Integer}
 */
Flickr.SearchResult.prototype.pages = 0;

/**
 * @type {Integer}
 */
Flickr.SearchResult.prototype.perpage = 0;

/**
 * @type {Integer}
 */
Flickr.SearchResult.prototype.total = 0;

/**
 * @type {PhotoSummary[]}
 */
Flickr.SearchResult.prototype.photo = [];