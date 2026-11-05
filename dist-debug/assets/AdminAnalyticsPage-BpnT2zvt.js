import { r as __toESM } from "./rolldown-runtime-SbdDWaPq.js";
import { C as clsx, J as require_react, L as require_jsx_runtime, z as Link } from "./dist-CiZ_rQl8.js";
import { t as RefreshCw } from "./refresh-cw-CqBrT0bt.js";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-BitaWzvs.js";
import { n as Button, t as Badge } from "./badge-CsydfRnh.js";
import { h as toast, m as Skeleton } from "./index-BqTDaTws.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-B8vDdK30.js";
import { n as Area, r as CartesianGrid, t as AreaChart } from "./AreaChart-DUFcGMRS.js";
import { $ as require_isNil, D as getValueByDataKey, F as Cell, G as hasClipDot, H as Layer, I as ResponsiveContainer, J as interpolateNumber, L as Tooltip, O as ErrorBar, R as Global, U as filterProps, W as findAllByType, Z as uniqueId, _ as Curve, f as formatAxisMap, g as es6_default, h as Dot, i as XAxis, k as require_isEqual, n as generateCategoricalChart, p as Bar, r as YAxis, t as BarChart, tt as require_isFunction, v as LabelList, w as getCateCoordinateOfLine, z as Legend } from "./BarChart-Dcrhwdwr.js";
import { t as AdminLayout } from "./AdminLayout-RSqDNN0w.js";
import { a as getMediaDistribution, n as getActivity, o as getStatusDistribution, s as getTopTitles, u as getUserGrowth } from "./admin-D_OTUGmL.js";
import { S as tmdbImageUrl } from "./tmdb-D_Jm8xAZ.js";
// node_modules/.pnpm/recharts@2.15.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/recharts/es6/cartesian/Line.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_isFunction = /* @__PURE__ */ __toESM(require_isFunction());
var import_isNil = /* @__PURE__ */ __toESM(require_isNil());
var import_isEqual = /* @__PURE__ */ __toESM(require_isEqual());
var _excluded = [
	"type",
	"layout",
	"connectNulls",
	"ref"
];
var _excluded2 = ["key"];
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
		return typeof o;
	} : function(o) {
		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	}, _typeof(o);
}
function _objectWithoutProperties(source, excluded) {
	if (source == null) return {};
	var target = _objectWithoutPropertiesLoose(source, excluded);
	var key, i;
	if (Object.getOwnPropertySymbols) {
		var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
		for (i = 0; i < sourceSymbolKeys.length; i++) {
			key = sourceSymbolKeys[i];
			if (excluded.indexOf(key) >= 0) continue;
			if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
			target[key] = source[key];
		}
	}
	return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
	if (source == null) return {};
	var target = {};
	for (var key in source) if (Object.prototype.hasOwnProperty.call(source, key)) {
		if (excluded.indexOf(key) >= 0) continue;
		target[key] = source[key];
	}
	return target;
}
function _extends() {
	_extends = Object.assign ? Object.assign.bind() : function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
		}
		return target;
	};
	return _extends.apply(this, arguments);
}
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r) {
			return Object.getOwnPropertyDescriptor(e, r).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
			_defineProperty(e, r, t[r]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
			Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
		});
	}
	return e;
}
function _toConsumableArray(arr) {
	return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
	throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(o, minLen) {
	if (!o) return;
	if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	var n = Object.prototype.toString.call(o).slice(8, -1);
	if (n === "Object" && o.constructor) n = o.constructor.name;
	if (n === "Map" || n === "Set") return Array.from(o);
	if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _iterableToArray(iter) {
	if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
	if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayLikeToArray(arr, len) {
	if (len == null || len > arr.length) len = arr.length;
	for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
	return arr2;
}
function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(target, props) {
	for (var i = 0; i < props.length; i++) {
		var descriptor = props[i];
		descriptor.enumerable = descriptor.enumerable || false;
		descriptor.configurable = true;
		if ("value" in descriptor) descriptor.writable = true;
		Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
	}
}
function _createClass(Constructor, protoProps, staticProps) {
	if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	if (staticProps) _defineProperties(Constructor, staticProps);
	Object.defineProperty(Constructor, "prototype", { writable: false });
	return Constructor;
}
function _callSuper(t, o, e) {
	return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
}
function _possibleConstructorReturn(self, call) {
	if (call && (_typeof(call) === "object" || typeof call === "function")) return call;
	else if (call !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
	return _assertThisInitialized(self);
}
function _assertThisInitialized(self) {
	if (self === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	return self;
}
function _isNativeReflectConstruct() {
	try {
		var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
	} catch (t) {}
	return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
		return !!t;
	})();
}
function _getPrototypeOf(o) {
	_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
		return o.__proto__ || Object.getPrototypeOf(o);
	};
	return _getPrototypeOf(o);
}
function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) throw new TypeError("Super expression must either be null or a function");
	subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: {
		value: subClass,
		writable: true,
		configurable: true
	} });
	Object.defineProperty(subClass, "prototype", { writable: false });
	if (superClass) _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
	_setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
		o.__proto__ = p;
		return o;
	};
	return _setPrototypeOf(o, p);
}
function _defineProperty(obj, key, value) {
	key = _toPropertyKey(key);
	if (key in obj) Object.defineProperty(obj, key, {
		value,
		enumerable: true,
		configurable: true,
		writable: true
	});
	else obj[key] = value;
	return obj;
}
function _toPropertyKey(t) {
	var i = _toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}
var Line = /*#__PURE__*/ function(_PureComponent) {
	function Line() {
		var _this;
		_classCallCheck(this, Line);
		for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
		_this = _callSuper(this, Line, [].concat(args));
		_defineProperty(_this, "state", {
			isAnimationFinished: true,
			totalLength: 0
		});
		_defineProperty(_this, "generateSimpleStrokeDasharray", function(totalLength, length) {
			return "".concat(length, "px ").concat(totalLength - length, "px");
		});
		_defineProperty(_this, "getStrokeDasharray", function(length, totalLength, lines) {
			var lineLength = lines.reduce(function(pre, next) {
				return pre + next;
			});
			if (!lineLength) return _this.generateSimpleStrokeDasharray(totalLength, length);
			var count = Math.floor(length / lineLength);
			var remainLength = length % lineLength;
			var restLength = totalLength - length;
			var remainLines = [];
			for (var i = 0, sum = 0; i < lines.length; sum += lines[i], ++i) if (sum + lines[i] > remainLength) {
				remainLines = [].concat(_toConsumableArray(lines.slice(0, i)), [remainLength - sum]);
				break;
			}
			var emptyLines = remainLines.length % 2 === 0 ? [0, restLength] : [restLength];
			return [].concat(_toConsumableArray(Line.repeat(lines, count)), _toConsumableArray(remainLines), emptyLines).map(function(line) {
				return "".concat(line, "px");
			}).join(", ");
		});
		_defineProperty(_this, "id", uniqueId("recharts-line-"));
		_defineProperty(_this, "pathRef", function(node) {
			_this.mainCurve = node;
		});
		_defineProperty(_this, "handleAnimationEnd", function() {
			_this.setState({ isAnimationFinished: true });
			if (_this.props.onAnimationEnd) _this.props.onAnimationEnd();
		});
		_defineProperty(_this, "handleAnimationStart", function() {
			_this.setState({ isAnimationFinished: false });
			if (_this.props.onAnimationStart) _this.props.onAnimationStart();
		});
		return _this;
	}
	_inherits(Line, _PureComponent);
	return _createClass(Line, [
		{
			key: "componentDidMount",
			value: function componentDidMount() {
				if (!this.props.isAnimationActive) return;
				var totalLength = this.getTotalLength();
				this.setState({ totalLength });
			}
		},
		{
			key: "componentDidUpdate",
			value: function componentDidUpdate() {
				if (!this.props.isAnimationActive) return;
				var totalLength = this.getTotalLength();
				if (totalLength !== this.state.totalLength) this.setState({ totalLength });
			}
		},
		{
			key: "getTotalLength",
			value: function getTotalLength() {
				var curveDom = this.mainCurve;
				try {
					return curveDom && curveDom.getTotalLength && curveDom.getTotalLength() || 0;
				} catch (err) {
					return 0;
				}
			}
		},
		{
			key: "renderErrorBar",
			value: function renderErrorBar(needClip, clipPathId) {
				if (this.props.isAnimationActive && !this.state.isAnimationFinished) return null;
				var _this$props = this.props, points = _this$props.points, xAxis = _this$props.xAxis, yAxis = _this$props.yAxis, layout = _this$props.layout, children = _this$props.children;
				var errorBarItems = findAllByType(children, ErrorBar);
				if (!errorBarItems) return null;
				var dataPointFormatter = function dataPointFormatter(dataPoint, dataKey) {
					return {
						x: dataPoint.x,
						y: dataPoint.y,
						value: dataPoint.value,
						errorVal: getValueByDataKey(dataPoint.payload, dataKey)
					};
				};
				var errorBarProps = { clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null };
				return /*#__PURE__*/ import_react.createElement(Layer, errorBarProps, errorBarItems.map(function(item) {
					return /*#__PURE__*/ import_react.cloneElement(item, {
						key: "bar-".concat(item.props.dataKey),
						data: points,
						xAxis,
						yAxis,
						layout,
						dataPointFormatter
					});
				}));
			}
		},
		{
			key: "renderDots",
			value: function renderDots(needClip, clipDot, clipPathId) {
				if (this.props.isAnimationActive && !this.state.isAnimationFinished) return null;
				var _this$props2 = this.props, dot = _this$props2.dot, points = _this$props2.points, dataKey = _this$props2.dataKey;
				var lineProps = filterProps(this.props, false);
				var customDotProps = filterProps(dot, true);
				var dots = points.map(function(entry, i) {
					var dotProps = _objectSpread(_objectSpread(_objectSpread({
						key: "dot-".concat(i),
						r: 3
					}, lineProps), customDotProps), {}, {
						index: i,
						cx: entry.x,
						cy: entry.y,
						value: entry.value,
						dataKey,
						payload: entry.payload,
						points
					});
					return Line.renderDotItem(dot, dotProps);
				});
				var dotsProps = { clipPath: needClip ? "url(#clipPath-".concat(clipDot ? "" : "dots-").concat(clipPathId, ")") : null };
				return /*#__PURE__*/ import_react.createElement(Layer, _extends({
					className: "recharts-line-dots",
					key: "dots"
				}, dotsProps), dots);
			}
		},
		{
			key: "renderCurveStatically",
			value: function renderCurveStatically(points, needClip, clipPathId, props) {
				var _this$props3 = this.props, type = _this$props3.type, layout = _this$props3.layout, connectNulls = _this$props3.connectNulls;
				_this$props3.ref;
				var others = _objectWithoutProperties(_this$props3, _excluded);
				var curveProps = _objectSpread(_objectSpread(_objectSpread({}, filterProps(others, true)), {}, {
					fill: "none",
					className: "recharts-line-curve",
					clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null,
					points
				}, props), {}, {
					type,
					layout,
					connectNulls
				});
				return /*#__PURE__*/ import_react.createElement(Curve, _extends({}, curveProps, { pathRef: this.pathRef }));
			}
		},
		{
			key: "renderCurveWithAnimation",
			value: function renderCurveWithAnimation(needClip, clipPathId) {
				var _this2 = this;
				var _this$props4 = this.props, points = _this$props4.points, strokeDasharray = _this$props4.strokeDasharray, isAnimationActive = _this$props4.isAnimationActive, animationBegin = _this$props4.animationBegin, animationDuration = _this$props4.animationDuration, animationEasing = _this$props4.animationEasing, animationId = _this$props4.animationId, animateNewValues = _this$props4.animateNewValues, width = _this$props4.width, height = _this$props4.height;
				var _this$state = this.state, prevPoints = _this$state.prevPoints, totalLength = _this$state.totalLength;
				return /*#__PURE__*/ import_react.createElement(es6_default, {
					begin: animationBegin,
					duration: animationDuration,
					isActive: isAnimationActive,
					easing: animationEasing,
					from: { t: 0 },
					to: { t: 1 },
					key: "line-".concat(animationId),
					onAnimationEnd: this.handleAnimationEnd,
					onAnimationStart: this.handleAnimationStart
				}, function(_ref) {
					var t = _ref.t;
					if (prevPoints) {
						var prevPointsDiffFactor = prevPoints.length / points.length;
						var stepData = points.map(function(entry, index) {
							var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
							if (prevPoints[prevPointIndex]) {
								var prev = prevPoints[prevPointIndex];
								var interpolatorX = interpolateNumber(prev.x, entry.x);
								var interpolatorY = interpolateNumber(prev.y, entry.y);
								return _objectSpread(_objectSpread({}, entry), {}, {
									x: interpolatorX(t),
									y: interpolatorY(t)
								});
							}
							if (animateNewValues) {
								var _interpolatorX = interpolateNumber(width * 2, entry.x);
								var _interpolatorY = interpolateNumber(height / 2, entry.y);
								return _objectSpread(_objectSpread({}, entry), {}, {
									x: _interpolatorX(t),
									y: _interpolatorY(t)
								});
							}
							return _objectSpread(_objectSpread({}, entry), {}, {
								x: entry.x,
								y: entry.y
							});
						});
						return _this2.renderCurveStatically(stepData, needClip, clipPathId);
					}
					var curLength = interpolateNumber(0, totalLength)(t);
					var currentStrokeDasharray;
					if (strokeDasharray) {
						var lines = "".concat(strokeDasharray).split(/[,\s]+/gim).map(function(num) {
							return parseFloat(num);
						});
						currentStrokeDasharray = _this2.getStrokeDasharray(curLength, totalLength, lines);
					} else currentStrokeDasharray = _this2.generateSimpleStrokeDasharray(totalLength, curLength);
					return _this2.renderCurveStatically(points, needClip, clipPathId, { strokeDasharray: currentStrokeDasharray });
				});
			}
		},
		{
			key: "renderCurve",
			value: function renderCurve(needClip, clipPathId) {
				var _this$props5 = this.props, points = _this$props5.points, isAnimationActive = _this$props5.isAnimationActive;
				var _this$state2 = this.state, prevPoints = _this$state2.prevPoints, totalLength = _this$state2.totalLength;
				if (isAnimationActive && points && points.length && (!prevPoints && totalLength > 0 || !(0, import_isEqual.default)(prevPoints, points))) return this.renderCurveWithAnimation(needClip, clipPathId);
				return this.renderCurveStatically(points, needClip, clipPathId);
			}
		},
		{
			key: "render",
			value: function render() {
				var _filterProps;
				var _this$props6 = this.props, hide = _this$props6.hide, dot = _this$props6.dot, points = _this$props6.points, className = _this$props6.className, xAxis = _this$props6.xAxis, yAxis = _this$props6.yAxis, top = _this$props6.top, left = _this$props6.left, width = _this$props6.width, height = _this$props6.height, isAnimationActive = _this$props6.isAnimationActive, id = _this$props6.id;
				if (hide || !points || !points.length) return null;
				var isAnimationFinished = this.state.isAnimationFinished;
				var hasSinglePoint = points.length === 1;
				var layerClass = clsx("recharts-line", className);
				var needClipX = xAxis && xAxis.allowDataOverflow;
				var needClipY = yAxis && yAxis.allowDataOverflow;
				var needClip = needClipX || needClipY;
				var clipPathId = (0, import_isNil.default)(id) ? this.id : id;
				var _ref2 = (_filterProps = filterProps(dot, false)) !== null && _filterProps !== void 0 ? _filterProps : {
					r: 3,
					strokeWidth: 2
				}, _ref2$r = _ref2.r, r = _ref2$r === void 0 ? 3 : _ref2$r, _ref2$strokeWidth = _ref2.strokeWidth, strokeWidth = _ref2$strokeWidth === void 0 ? 2 : _ref2$strokeWidth;
				var _ref3$clipDot = (hasClipDot(dot) ? dot : {}).clipDot, clipDot = _ref3$clipDot === void 0 ? true : _ref3$clipDot;
				var dotSize = r * 2 + strokeWidth;
				return /*#__PURE__*/ import_react.createElement(Layer, { className: layerClass }, needClipX || needClipY ? /*#__PURE__*/ import_react.createElement("defs", null, /*#__PURE__*/ import_react.createElement("clipPath", { id: "clipPath-".concat(clipPathId) }, /*#__PURE__*/ import_react.createElement("rect", {
					x: needClipX ? left : left - width / 2,
					y: needClipY ? top : top - height / 2,
					width: needClipX ? width : width * 2,
					height: needClipY ? height : height * 2
				})), !clipDot && /*#__PURE__*/ import_react.createElement("clipPath", { id: "clipPath-dots-".concat(clipPathId) }, /*#__PURE__*/ import_react.createElement("rect", {
					x: left - dotSize / 2,
					y: top - dotSize / 2,
					width: width + dotSize,
					height: height + dotSize
				}))) : null, !hasSinglePoint && this.renderCurve(needClip, clipPathId), this.renderErrorBar(needClip, clipPathId), (hasSinglePoint || dot) && this.renderDots(needClip, clipDot, clipPathId), (!isAnimationActive || isAnimationFinished) && LabelList.renderCallByParent(this.props, points));
			}
		}
	], [
		{
			key: "getDerivedStateFromProps",
			value: function getDerivedStateFromProps(nextProps, prevState) {
				if (nextProps.animationId !== prevState.prevAnimationId) return {
					prevAnimationId: nextProps.animationId,
					curPoints: nextProps.points,
					prevPoints: prevState.curPoints
				};
				if (nextProps.points !== prevState.curPoints) return { curPoints: nextProps.points };
				return null;
			}
		},
		{
			key: "repeat",
			value: function repeat(lines, count) {
				var linesUnit = lines.length % 2 !== 0 ? [].concat(_toConsumableArray(lines), [0]) : lines;
				var result = [];
				for (var i = 0; i < count; ++i) result = [].concat(_toConsumableArray(result), _toConsumableArray(linesUnit));
				return result;
			}
		},
		{
			key: "renderDotItem",
			value: function renderDotItem(option, props) {
				var dotItem;
				if (/*#__PURE__*/ import_react.isValidElement(option)) dotItem = /*#__PURE__*/ import_react.cloneElement(option, props);
				else if ((0, import_isFunction.default)(option)) dotItem = option(props);
				else {
					var key = props.key, dotProps = _objectWithoutProperties(props, _excluded2);
					var className = clsx("recharts-line-dot", typeof option !== "boolean" ? option.className : "");
					dotItem = /*#__PURE__*/ import_react.createElement(Dot, _extends({ key }, dotProps, { className }));
				}
				return dotItem;
			}
		}
	]);
}(import_react.PureComponent);
_defineProperty(Line, "displayName", "Line");
_defineProperty(Line, "defaultProps", {
	xAxisId: 0,
	yAxisId: 0,
	connectNulls: false,
	activeDot: true,
	dot: true,
	legendType: "line",
	stroke: "#3182bd",
	strokeWidth: 1,
	fill: "#fff",
	points: [],
	isAnimationActive: !Global.isSsr,
	animateNewValues: true,
	animationBegin: 0,
	animationDuration: 1500,
	animationEasing: "ease",
	hide: false,
	label: false
});
/**
* Compose the data of each group
* @param {Object} props The props from the component
* @param  {Object} xAxis   The configuration of x-axis
* @param  {Object} yAxis   The configuration of y-axis
* @param  {String} dataKey The unique key of a group
* @return {Array}  Composed data
*/
_defineProperty(Line, "getComposedData", function(_ref4) {
	var props = _ref4.props, xAxis = _ref4.xAxis, yAxis = _ref4.yAxis, xAxisTicks = _ref4.xAxisTicks, yAxisTicks = _ref4.yAxisTicks, dataKey = _ref4.dataKey, bandSize = _ref4.bandSize, displayedData = _ref4.displayedData, offset = _ref4.offset;
	var layout = props.layout;
	return _objectSpread({
		points: displayedData.map(function(entry, index) {
			var value = getValueByDataKey(entry, dataKey);
			if (layout === "horizontal") return {
				x: getCateCoordinateOfLine({
					axis: xAxis,
					ticks: xAxisTicks,
					bandSize,
					entry,
					index
				}),
				y: (0, import_isNil.default)(value) ? null : yAxis.scale(value),
				value,
				payload: entry
			};
			return {
				x: (0, import_isNil.default)(value) ? null : xAxis.scale(value),
				y: getCateCoordinateOfLine({
					axis: yAxis,
					ticks: yAxisTicks,
					bandSize,
					entry,
					index
				}),
				value,
				payload: entry
			};
		}),
		layout
	}, offset);
});
// node_modules/.pnpm/recharts@2.15.4_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/recharts/es6/chart/LineChart.js
/**
* @fileOverview Line Chart
*/
var LineChart = generateCategoricalChart({
	chartName: "LineChart",
	GraphicalChild: Line,
	axisComponents: [{
		axisType: "xAxis",
		AxisComp: XAxis
	}, {
		axisType: "yAxis",
		AxisComp: YAxis
	}],
	formatAxisMap
});
// src/pages/admin/AdminAnalyticsPage.tsx
var import_jsx_runtime = require_jsx_runtime();
var COLORS = [
	"hsl(210,80%,52%)",
	"hsl(38,75%,52%)",
	"hsl(160,60%,45%)",
	"hsl(280,60%,55%)",
	"hsl(0,65%,55%)"
];
function AdminAnalyticsPage() {
	const [days, setDays] = (0, import_react.useState)(30);
	const [growth, setGrowth] = (0, import_react.useState)([]);
	const [activity, setActivity] = (0, import_react.useState)([]);
	const [topMovies, setTopMovies] = (0, import_react.useState)([]);
	const [topTV, setTopTV] = (0, import_react.useState)([]);
	const [statusData, setStatusData] = (0, import_react.useState)([]);
	const [mediaData, setMediaData] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(async (showRefresh = false) => {
		if (showRefresh) setRefreshing(true);
		else setLoading(true);
		try {
			const [g, a, tm, ttv, sd, md] = await Promise.all([
				getUserGrowth(days),
				getActivity(days),
				getTopTitles(10, "movie"),
				getTopTitles(10, "tv"),
				getStatusDistribution(),
				getMediaDistribution()
			]);
			setGrowth(g);
			setActivity(a);
			setTopMovies(tm);
			setTopTV(ttv);
			setStatusData(sd.map((r) => ({
				name: r.status,
				value: Number(r.cnt)
			})));
			setMediaData(md.map((r) => ({
				name: r.media_type === "movie" ? "Movies" : "TV Shows",
				value: Number(r.cnt)
			})));
		} catch {
			toast.error("Failed to load analytics");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [days]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const growthData = growth.map((r) => ({
		date: r.day.slice(5),
		new: Number(r.new_users),
		total: Number(r.cumulative_users)
	}));
	const activityData = activity.map((r) => ({
		date: r.day.slice(5),
		library: Number(r.library_adds),
		favorites: Number(r.favorites_adds),
		watchlist: Number(r.watchlist_adds)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, {
		title: "Analytics",
		breadcrumbs: [{ label: "Analytics" }],
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: String(days),
				onValueChange: (v) => setDays(Number(v)),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "h-8 w-28 text-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "7",
						children: "7 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "30",
						children: "30 days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "90",
						children: "90 days"
					})
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => load(true),
				disabled: refreshing,
				className: "h-8 gap-1.5 text-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}` })
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold",
						children: "User Growth"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "Daily new signups and cumulative total"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-0",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-52 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 220,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: growthData,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: 8,
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "total",
									stroke: COLORS[0],
									strokeWidth: 2,
									dot: false,
									name: "Total Users"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "new",
									stroke: COLORS[2],
									strokeWidth: 2,
									dot: false,
									strokeDasharray: "4 2",
									name: "New Users"
								})
							]
						})
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold",
						children: "Daily Watch Activity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "Items added to library, favorites, and watchlist per day"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-0",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-52 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 220,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: activityData,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: [
									"lib",
									"fav",
									"wl"
								].map((k, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: `g${k}`,
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "5%",
										stopColor: COLORS[i],
										stopOpacity: .2
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "95%",
										stopColor: COLORS[i],
										stopOpacity: 0
									})]
								}, k)) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									background: "hsl(var(--card))",
									border: "1px solid hsl(var(--border))",
									borderRadius: 8,
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "library",
									stroke: COLORS[0],
									fill: "url(#glib)",
									strokeWidth: 2,
									name: "Library"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "favorites",
									stroke: COLORS[1],
									fill: "url(#gfav)",
									strokeWidth: 2,
									name: "Favorites"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "watchlist",
									stroke: COLORS[2],
									fill: "url(#gwl)",
									strokeWidth: 2,
									name: "Watchlist"
								})
							]
						})
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-4",
					children: [{
						label: "Top Movies",
						items: topMovies,
						type: "movie"
					}, {
						label: "Top TV Shows",
						items: topTV,
						type: "tv"
					}].map(({ label, items, type }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-semibold",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "text-xs",
							children: "Most saved by users"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pt-0",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }, i))
						}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground py-4 text-center",
							children: "No data"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1",
							children: items.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: `/detail/${type}/${t.tmdb_id}`,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-5 text-[11px] text-muted-foreground tabular-nums text-center",
										children: i + 1
									}),
									t.poster_path && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: tmdbImageUrl(t.poster_path, "w45") ?? "",
										alt: t.title,
										className: "w-7 h-10 rounded object-cover shrink-0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "flex-1 text-xs font-medium truncate",
										children: t.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "secondary",
										className: "text-[10px] shrink-0",
										children: [t.save_count, " saves"]
									})
								]
							}, t.tmdb_id))
						})
					})] }, type))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-semibold",
							children: "Library Status Distribution"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pt-0",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 200,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: statusData,
								layout: "vertical",
								barSize: 14,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "hsl(var(--border))",
										horizontal: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										type: "number",
										tick: {
											fontSize: 10,
											fill: "hsl(var(--muted-foreground))"
										},
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										type: "category",
										dataKey: "name",
										tick: {
											fontSize: 9,
											fill: "hsl(var(--muted-foreground))"
										},
										width: 85,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: 8,
										fontSize: 12
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "value",
										name: "Items",
										radius: [
											0,
											2,
											2,
											0
										],
										children: statusData.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: COLORS[i % COLORS.length] }, i))
									})
								]
							})
						})
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-semibold",
							children: "Content Type Split"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pt-0",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 200,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: mediaData,
								barSize: 36,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "hsl(var(--border))"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										tick: {
											fontSize: 11,
											fill: "hsl(var(--muted-foreground))"
										},
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fontSize: 10,
											fill: "hsl(var(--muted-foreground))"
										},
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: 8,
										fontSize: 12
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "value",
										name: "Items",
										radius: [
											4,
											4,
											0,
											0
										],
										children: mediaData.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: COLORS[i % COLORS.length] }, i))
									})
								]
							})
						})
					})] })]
				})
			]
		})
	});
}
export { AdminAnalyticsPage as default };
