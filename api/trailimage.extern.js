/**
 * Flickr set to be featured
 */
FeatureSet = {};
/**
 * @type {String}
 */
FeatureSet.prototype.id = null;
/**
 * @type {String}
 */
FeatureSet.prototype.title = null;


PDFStyleConfig = {};

/**
 * @type {PDFStyleSettings}
 */
PDFStyleConfig.prototype.settings = null;

/**
 * @type {PDFStyleRuleList}
 */
PDFStyleConfig.prototype.rules = null;

PDFStyleSettings = {};

/**
 * @type {Object.<String>}
 */
PDFStyleSettings.prototype.fonts = null;

/**
 * @type {Object.<Number[]>}
 */
PDFStyleSettings.prototype.colors = null;

/**
 * @type {Object.<PDFStyleRule>}
 */
PDFStyleRuleList = {};

/**
 * @type {PDFStyleRule}
 */
PDFStyleRuleList.prototype.defaultPage = null;

/**
 * @type {PDFStyleRule}
 */
PDFStyleRuleList.prototype.defaultText = null;


PDFStyleRule = {};

/**
 * @type {String}
 */
PDFStyleRule.prototype.align = null;

/**
 * @type {String|Number[]}
 */
PDFStyleRule.prototype.color = null;

/**
 * @type {String}
 */
PDFStyleRule.prototype.font = null;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.fontSize = NaN;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.height = NaN;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.margin = NaN;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.marginTop = NaN;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.marginRight = NaN;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.marginLeft = NaN;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.marginBottom = NaN;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.minHeight = NaN;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.minWidth = NaN;

/**
 * @type {String}
 */
PDFStyleRule.prototype.scale = null;

/**
 * @type {Number}
 */
PDFStyleRule.prototype.width = NaN;