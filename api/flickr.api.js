/**
 * @fileoverview Externs for Flickr
 * @see http://www.flickr.com/services/api/
 * @externs
 */

/**
 * @type {Object}
 */
Flickr =
{
	/**
	 * @enum {String}
	 */
	Media:
	{
		photo: 'photo',
		video: 'video'
	},

	/*
	 * @enum {String}
	 */
	ExifTag:
	{
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
	 * @enum {int}
	 */
	Boolean:
	{
		'true': 1,
		'false': 0
	},

	/**
	 * @type {String}
	 */
	Status:
	{
		ok: 'okay',
		fail: 'fail'
	},

	/**
	 * @enum {int}
	 * @see http://www.flickr.com/services/api/flickr.photos.licenses.getInfo.html
	 */
	License:
	{
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
	SafetyLevel:
	{
		Safe: 1,
		Moderate: 2,
		Restricted: 3
	}
};

// Tree -----------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.collections.getTree.html
 */
Flickr.prototype.Tree;

/**
 * @type {Flickr.Collection[]}
 */
Flickr.Tree.prototype.collection;

// Collection -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Collection;

/**
 * @type {String}
 */
Flickr.Collection.prototype.id;

/**
 * @type {String}
 */
Flickr.Collection.prototype.title;

/**
 * @type {String}
 */
Flickr.Collection.prototype.description;

/**
 * @type {String}
 */
Flickr.Collection.prototype.iconlarge;

/**
 * @type {String}
 */
Flickr.Collection.prototype.iconsmall;

/**
 * @type {Flickr.Collection[]}
 */
Flickr.Collection.prototype.collection;

/**
 * @type {Flickr.SetSummary[]}
 */
Flickr.Collection.prototype.set;

// SetSummary -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.SetSummary;

/**
 * @type {String}
 */
Flickr.SetSummary.prototype.id;

/**
 * @type {String}
 */
Flickr.SetSummary.prototype.title;

/**
 * @type {String}
 */
Flickr.SetSummary.prototype.description;

// Response -------------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Response;

/**
 * @type {Flickr.SetPhotos|Flickr.SetInfo}
 */
Flickr.Response.prototype.photoset;

/**
 * @type {Flickr.MemberSet[]}
 */
Flickr.Response.prototype.set;

/**
 * @type {Flickr.Tree}
 */
Flickr.Response.prototype.collections;

/**
 * @type {Flickr.PhotoInfo}
 */
Flickr.Response.prototype.photo;

/**
 * @type {Flickr.SizeList}
 */
Flickr.Response.prototype.sizes;

/**
 * @type {Flickr.Status}
 */
Flickr.Response.prototype.stat;

/**
 * @type {String}
 */
Flickr.Response.prototype.message;

/**
 * @type {Flickr.SearchResult}
 */
Flickr.Response.prototype.photos;

// Content --------------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Content;

/**
 * @type {String}
 */
Flickr.Content.prototype._content;

// Exif -----------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/explore/flickr.photos.getExif
 */
Flickr.prototype.PhotoExif;

/**
 * @type {Flickr.PhotoSummary}
 */
Flickr.PhotoExif.prototype.photo;

/**
 * @type {Flickr.Exif[]}
 */
Flickr.PhotoExif.photo.prototype.exif;

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/explore/flickr.photos.getExif
 */
Flickr.prototype.Exif;


/**
 * @type {Enum.ExifSpace}
 */
Flickr.Exif.prototype.tagspace;

/**
 * @type {Number}
 */
Flickr.Exif.prototype.tagspaceid;

/**
 * @type {Flickr.ExifTag|String}
 */
Flickr.Exif.prototype.tag;

/**
 * @type {String}
 */
Flickr.Exif.prototype.label;

/**
 * @type {Flickr.Content}
 */
Flickr.Exif.prototype.raw;

// Size -----------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photos.getSizes.html
 */
Flickr.prototype.Size;

/**
 * @type {String}
 */
Flickr.Size.prototype.label;

/**
 * @type {int}
 */
Flickr.Size.prototype.width;

/**
 * @type {int}
 */
Flickr.Size.prototype.height;

/**
 * @type {String}
 */
Flickr.Size.prototype.source;

/**
 * @type {String}
 */
Flickr.Size.prototype.url;

/**
 * @type {Flickr.Media}
 */
Flickr.Size.prototype.media;

// SizeList ------------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Usage}
 * @see http://www.flickr.com/services/api/flickr.photos.getSizes.html
 */
Flickr.prototype.SizeList;

/**
 * @type {Flickr.Size[]}
 */
Flickr.SizeList.prototype.size;

// MemberSet ------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photos.getAllContexts.html
 */
Flickr.prototype.MemberSet;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.id;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.title;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.primary;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.secret;

/**
 * @type {String}
 */
Flickr.MemberSet.prototype.server;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.farm;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.view_count;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.comment_count;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.count_photo;

/**
 * @type {int}
 */
Flickr.MemberSet.prototype.count_video;

// PhotoMembership ------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photos.getAllContexts.html
 */
Flickr.prototype.PhotoMembership;

/**
 * @type {Flickr.MemberSet[]}
 */
Flickr.PhotoMembership.prototype.set;

// URL ------------------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Content}
 */
Flickr.prototype.URL;

/**
 * @type {String}
 */
Flickr.URL.prototype.type;

// LocationPermission ---------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.LocationPermission;

/**
 * @type {Flickr.Boolean}
 */
Flickr.LocationPermission.prototype.ispublic;

/**
 * @type {Flickr.Boolean}
 */
Flickr.LocationPermission.prototype.iscontant;

/**
 * @type {Flickr.Boolean}
 */
Flickr.LocationPermission.prototype.isfriend;

/**
 * @type {Flickr.Boolean}
 */
Flickr.LocationPermission.prototype.isfamily;

// Place ----------------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Content}
 */
Flickr.prototype.Place;

/**
 * @type {String}
 */
Flickr.Place.prototype.place_id;

/**
 * @type {String}
 */
Flickr.Place.prototype.woeid;

// Location -------------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Place}
 */
Flickr.prototype.Location;

/**
 * @type {Number}
 */
Flickr.Location.prototype.latitude;

/**
 * @type {Number}
 */
Flickr.Location.prototype.longitude;

/**
 * @type {Number}
 */
Flickr.Location.prototype.accuracy;

/**
 * @type {Number}
 */
Flickr.Location.prototype.context;

/**
 * @type {Flickr.Place}
 */
Flickr.Location.prototype.county;

/**
 * @type {Flickr.Place}
 */
Flickr.Location.prototype.region;

/**
 * @type {Flickr.Place}
 */
Flickr.Location.prototype.country;

// TagSummary -----------------------------------------------------------------

/**
 * @type {Object}
 * @extends {Flickr.Content}
 */
Flickr.prototype.TagSummary;

/**
 * @type {String}
 */
Flickr.TagSummary.prototype.id;

/**
 * @type {String}
 */
Flickr.TagSummary.prototype.author;

/**
 * @type {String}
 */
Flickr.TagSummary.prototype.raw;

/**
 * @type {Number}
 */
Flickr.TagSummary.prototype.machine_tag;

// Usage ----------------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Usage;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Usage.prototype.candownload;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Usage.prototype.canblog;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Usage.prototype.canprint;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Usage.prototype.canshare;

// EditAbility ----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.EditAbility;

/**
 * @type {Flickr.Boolean}
 */
Flickr.EditAbility.prototype.cancomment;

/**
 * @type {Flickr.Boolean}
 */
Flickr.EditAbility.prototype.canaddmeta;

// Permission -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Permission;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Permission.prototype.permcomment;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Permission.prototype.permmetadata;

// PhotoDates -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.PhotoDates;

/**
 * @type {String}
 */
Flickr.PhotoDates.prototype.posted;

/**
 * @type {String}
 */
Flickr.PhotoDates.prototype.taken;

/**
 * @type {Number}
 */
Flickr.PhotoDates.prototype.takengranularity;

/**
 * @type {String}
 */
Flickr.PhotoDates.prototype.lastupdate;

// Visibility -----------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Visibility;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Visibility.prototype.ispublic;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Visibility.prototype.isfriend;

/**
 * @type {Flickr.Boolean}
 */
Flickr.Visibility.prototype.isfamily;

// Owner ----------------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.Owner;

/**
 * @type {String}
 */
Flickr.Owner.prototype.nsid;

/**
 * @type {String}
 */
Flickr.Owner.prototype.username;

/**
 * @type {String}
 */
Flickr.Owner.prototype.location;

/**
 * @type {String}
 */
Flickr.Owner.prototype.iconserver;

/**
 * @type {Number}
 */
Flickr.Owner.prototype.iconfarm;

// Photo ----------------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photos.getInfo.html
 */
Flickr.prototype.PhotoInfo;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.id;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.secret;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.server;

/**
 * @type {Number}
 */
Flickr.PhotoInfo.prototype.farm;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.dateuploaded;

/**
 * @type {Flickr.Boolean}
 */
Flickr.PhotoInfo.prototype.isfavorite;

/**
 * @type {Flickr.License}
 */
Flickr.PhotoInfo.prototype.license;

/**
 * @type {Flickr.SafetyLevel}
 */
Flickr.PhotoInfo.prototype.safetylevel;

/**
 * @type {Flickr.Boolean}
 */
Flickr.PhotoInfo.prototype.rotate;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.originalsecret;

/**
 * @type {String}
 */
Flickr.PhotoInfo.prototype.originalformat;

/**
 * @type {Flickr.Owner}
 */
Flickr.PhotoInfo.prototype.owner;

/**
 * @type {Flickr.Content}
 */
Flickr.PhotoInfo.prototype.title;

/**
 * @type {Flickr.Content}
 */
Flickr.PhotoInfo.prototype.description;

/**
 * @type {Flickr.Visibility}
 */
Flickr.PhotoInfo.prototype.visibility;

/**
 * @type {Flickr.PhotoDates}
 */
Flickr.PhotoInfo.prototype.dates;

/**
 * @type {Number}
 */
Flickr.PhotoInfo.prototype.views;

/**
 * @type {Flickr.Permission}
 */
Flickr.PhotoInfo.prototype.permissions;

/**
 * @type {Flickr.EditAbility}
 */
Flickr.PhotoInfo.prototype.editability;

/**
 * @type {Flickr.EditAbility}
 */
Flickr.PhotoInfo.prototype.publiceditability;

/**
 * @type {Flickr.Usage}
 */
Flickr.PhotoInfo.prototype.usage;

/**
 * @type {Object}
 */
Flickr.PhotoInfo.prototype.tags = {};

/**
 * @type {Flickr.TagSummary[]}
 */
Flickr.PhotoInfo.prototype.tags.tag;

/**
 * @type {Flickr.Location}
 */
Flickr.PhotoInfo.prototype.location;

/**
 * @type {Flickr.LocationPermission}
 */
Flickr.PhotoInfo.prototype.geoperms;

/**
 * @type {Media}
 */
Flickr.PhotoInfo.prototype.media;

/**
 * @type {Object}
 */
Flickr.PhotoInfo.prototype.urls = {};

/**
 * @type {Flickr.URL[]}
 */
Flickr.PhotoInfo.prototype.urls.url;


// PhotoSummary ---------------------------------------------------------------

/**
 * @type {Object}
 */
Flickr.prototype.PhotoSummary;

/**
 * @type {String}
 */
Flickr.PhotoSummary.prototype.id;

/**
 * @type {String}
 */
Flickr.PhotoSummary.prototype.secret;

/**
 * @type {String}
 */
Flickr.PhotoSummary.prototype.server;

/**
 * @type {Number}
 */
Flickr.PhotoSummary.prototype.farm;

/**
 * @type {String}
 */
Flickr.PhotoSummary.prototype.title;

/**
 * @type {Flickr.Boolean}
 */
Flickr.PhotoSummary.prototype.isprimary;

/**
 * Space delimited list of photo tags
 * @type {String}
 */
Flickr.PhotoSummary.prototype.tags;

/**
 * If passed "description" extra
 * @type {Flickr.Content}
 */
Flickr.PhotoSummary.prototype.description;


/**
 * If passed "date_taken" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.datetaken;

/**
 * MySQL datetime (if passed "date_taken" extra)
 * @type {String}
 * @see http://www.flickr.com/services/api/misc.dates.html
 */
Flickr.PhotoSummary.prototype.datetaken;

/**
 * If passed "date_taken" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.datetakengranularity;

/**
 * If passed "geo" extra
 * @type {Number}
 */
Flickr.PhotoSummary.prototype.latitude;

/**
 * If passed "geo" extra
 * @type {Number}
 */
Flickr.PhotoSummary.prototype.longitude;

/**
 * If passed "geo" extra
 * @type {Number}
 */
Flickr.PhotoSummary.prototype.accuracy;

/**
 * If passed "geo" extra
 * @type {Number}
 */
Flickr.PhotoSummary.prototype.context;

/**
 * If passed "geo" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.place_id;

/**
 * If passed "geo" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.woeid;

/**
 * If passed "geo" extra
 * @type {Flickr.Boolean}
 */
Flickr.PhotoSummary.prototype.geo_is_family;

/**
 * If passed "geo" extra
 * @type {Flickr.Boolean}
 */
Flickr.PhotoSummary.prototype.geo_is_friend;

/**
 * If passed "geo" extra
 * @type {Flickr.Boolean}
 */
Flickr.PhotoSummary.prototype.geo_is_contact;


/**
 * If passed "geo" extra
 * @type {Flickr.Boolean}
 */
Flickr.PhotoSummary.prototype.geo_is_public;

/**
 * Unix timestamp (if passed "last_update" extra)
 * @type {String}
 * @see http://www.flickr.com/services/api/misc.dates.html
 */
Flickr.PhotoSummary.prototype.lastupdate;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_s;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_s;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_s;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_s;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_s;

/**
 * If passed "url_s" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_s;

/**
 * If passed "url_h" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_h;

/**
 * If passed "url_h" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_h;

/**
 * If passed "url_h" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_h;

/**
 * If passed "url_k" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_k;

/**
 * If passed "url_k" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_k;

/**
 * If passed "url_k" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_k;

/**
 * If passed "url_l" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_l;

/**
 * If passed "url_l" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_l;

/**
 * If passed "url_l" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_l;

/**
 * If passed "url_m" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_m;

/**
 * If passed "url_m" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_m;

/**
 * If passed "url_m" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_m;

/**
 * If passed "url_o" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.url_o;

/**
 * If passed "url_o" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.height_o;

/**
 * If passed "url_o" extra
 * @type {String}
 */
Flickr.PhotoSummary.prototype.width_o;


// PhotoSetPhotos -------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photosets.getPhotos.html
 */
Flickr.prototype.SetPhotos;

/**
 * @type {Flickr.SetInfo}
 */
Flickr.SetPhotos.prototype.photoset;

/**
 * @type {Flickr.PhotoSummary[]}
 */
Flickr.SetPhotos.prototype.photo;

/**
 * @type {Number}
 */
Flickr.SetPhotos.prototype.page;

/**
 * @type {String}
 */
Flickr.SetPhotos.prototype.per_page;

/**
 * @type {String}
 */
Flickr.SetPhotos.prototype.perpage;

/**
 * @type {Number}
 */
Flickr.SetPhotos.prototype.pages;

/**
 * @type {Number}
 */
Flickr.SetPhotos.prototype.total;


// PhotoSetInfo ---------------------------------------------------------------

/**
 * @type {Object}
 * @see http://www.flickr.com/services/api/flickr.photosets.getInfo.html
 */
Flickr.prototype.SetInfo;

/**
 * @type {Flickr.Content}
 */
Flickr.SetInfo.prototype.title;

/**
 * @type {Flickr.Content}
 */
Flickr.SetInfo.prototype.description;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.id;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.owner;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.username;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.primary;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.secret;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.server;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.farm;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.photos;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.count_views;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.count_comments;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.count_photos;

/**
 * @type {Number}
 */
Flickr.SetInfo.prototype.count_videos;

/**
 * @type {Flickr.Boolean}
 */
Flickr.SetInfo.prototype.can_comment;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.date_create;

/**
 * @type {String}
 */
Flickr.SetInfo.prototype.date_update;

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
Flickr.Response.Who.prototype.tags;

/**
 * @type {Object}
 */
Flickr.Tag = {};

/**
 * @type {String}
 */
Flickr.Tag.prototype.clean;

/**
 * @type {Flickr.Content[]}
 */
Flickr.Tag.prototype.raw;

// Search Results -------------------------------------------------------------

Flickr.SearchResult = {};

/**
 * @type {Integer}
 */
Flickr.SearchResult.prototype.page;

/**
 * @type {Integer}
 */
Flickr.SearchResult.prototype.pages;

/**
 * @type {Integer}
 */
Flickr.SearchResult.prototype.perpage;

/**
 * @type {Integer}
 */
Flickr.SearchResult.prototype.total;

/**
 * @type {PhotoSummary[]}
 */
Flickr.SearchResult.prototype.photo;