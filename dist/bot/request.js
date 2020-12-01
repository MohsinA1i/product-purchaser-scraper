"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom_1 = require("jsdom");
var Request = /** @class */ (function () {
    function Request(options) {
        this._options = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0',
        };
        Object.assign(this._options, options);
        this.cookieJar = new jsdom_1.CookieJar();
    }
    Object.defineProperty(Request.prototype, "userAgent", {
        set: function (newUserAgent) {
            this._options.userAgent = newUserAgent;
            if (this._requestDom)
                this._requestDom.window.close();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "hostname", {
        set: function (newHostname) {
            this._options.hostname = newHostname;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Request.prototype, "proxy", {
        set: function (newProxy) {
            this._options.proxy = newProxy;
            if (this._requestDom)
                this._requestDom.window.close();
        },
        enumerable: false,
        configurable: true
    });
    Request.prototype.dom = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var domOptions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        domOptions = {
                            resources: new jsdom_1.ResourceLoader({
                                proxy: this._options.proxy,
                                strictSSL: false,
                                userAgent: this._options.userAgent
                            }),
                            pretendToBeVisual: true,
                            cookieJar: this.cookieJar
                        };
                        domOptions.virtualConsole = new jsdom_1.VirtualConsole();
                        domOptions.virtualConsole.sendTo(console, { omitJSDOMErrors: false });
                        if (options.location) {
                            if (options.location.startsWith('/'))
                                options.location = "https://" + this._options.hostname + options.location;
                            domOptions.url = options.location;
                            domOptions.referrer = options.location;
                        }
                        if (options.runScripts) {
                            domOptions.runScripts = options.runScripts;
                            domOptions.beforeParse = function (window) {
                                window.matchMedia = _this.matchMediaStub;
                            };
                        }
                        if (!options.url) return [3 /*break*/, 2];
                        if (options.url.startsWith('/'))
                            options.url = "https://" + this._options.hostname + options.url;
                        return [4 /*yield*/, jsdom_1.JSDOM.fromURL(options.url, domOptions)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, new jsdom_1.JSDOM(options.content, domOptions)];
                }
            });
        });
    };
    Request.prototype.matchMediaStub = function () {
        return {
            media: '',
            matches: false,
            addListener: function () { },
            removeListener: function () { },
            onchange: function () { },
            addEventListener: function () { },
            removeEventListener: function () { },
            dispatchEvent: function () { return false; }
        };
    };
    Request.prototype.get = function (url, headers) {
        return __awaiter(this, void 0, void 0, function () {
            var dom, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("GET Request " + url);
                        return [4 /*yield*/, this.dom({ location: url, runScripts: 'outside-only' })];
                    case 1:
                        dom = _a.sent();
                        if (this._options.headers)
                            Object.assign(headers, this._options.headers);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                dom.window.executed = resolve;
                                dom.window.error = reject;
                                var script = "const xhr = new XMLHttpRequest();\n            xhr.onload = function() {\n                if (xhr.status >= 200 && xhr.status < 300)\n                    executed({\n                        url: xhr.responseURL,\n                        type: xhr.responseType,\n                        body: xhr.response\n                    });\n                else error({code: xhr.status, message: xhr.statusText});\n            };\n            xhr.open('GET', '" + url + "');\n            " + _this.setHeaderStatements(headers) + "\n            xhr.send();";
                                dom.window.eval(script);
                            })];
                    case 2:
                        response = _a.sent();
                        dom.window.close();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Request.prototype.post = function (url, data, headers) {
        return __awaiter(this, void 0, void 0, function () {
            var dom, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("POST Request " + url);
                        console.log("POST Data " + data);
                        return [4 /*yield*/, this.dom({ location: url, runScripts: 'outside-only' })];
                    case 1:
                        dom = _a.sent();
                        if (this._options.headers)
                            Object.assign(headers, this._options.headers);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                dom.window.executed = resolve;
                                dom.window.error = reject;
                                var script = "const xhr = new XMLHttpRequest();\n            xhr.onload = function() {\n                if (xhr.status >= 200 && xhr.status < 300)\n                    executed({\n                        url: xhr.responseURL,\n                        type: xhr.responseType,\n                        body: xhr.response\n                    });\n                else error({code: xhr.status, message: xhr.statusText});\n            };\n            xhr.open('POST', '" + url + "');\n            " + _this.setHeaderStatements(headers) + "\n            xhr.send('" + data + "');";
                                dom.window.eval(script);
                            })];
                    case 2:
                        response = _a.sent();
                        dom.window.close();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    Request.prototype.setHeaderStatements = function (headers) {
        var setHeaderStatements = '';
        for (var name_1 in headers)
            setHeaderStatements += "xhr.setRequestHeader('" + name_1 + "', '" + headers[name_1] + "');";
        return setHeaderStatements;
    };
    Request.prototype.submitForm = function (dom, formSelector, setValues, honeypotSelector) {
        return __awaiter(this, void 0, void 0, function () {
            var form, fields, values, _i, _a, field, data, _b, _c, field, name_2, response;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        form = dom.window.document.querySelector(formSelector);
                        fields = form.querySelectorAll('[name]:not([type="submit"])');
                        values = {};
                        for (_i = 0, _a = fields; _i < _a.length; _i++) {
                            field = _a[_i];
                            if (honeypotSelector) {
                                if (!field.matches(honeypotSelector))
                                    values[field.name] = field.value;
                            }
                            else
                                values[field.name] = field.value;
                        }
                        return [4 /*yield*/, setValues(values)];
                    case 1:
                        _d.sent();
                        data = '';
                        for (_b = 0, _c = fields; _b < _c.length; _b++) {
                            field = _c[_b];
                            if (honeypotSelector && field.matches(honeypotSelector))
                                data += "&" + field.name + "=";
                            else if (values[field.name]) {
                                data += "&" + field.name + "=" + values[field.name];
                                delete values[field.name];
                            }
                        }
                        for (name_2 in values)
                            data += "&" + name_2 + "=" + values[name_2];
                        data = encodeURI(data.slice(1));
                        dom.window.close();
                        return [4 /*yield*/, this.post(form.action, data, { 'Content-Type': 'application/x-www-form-urlencoded' })];
                    case 2:
                        response = _d.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    return Request;
}());
exports.default = Request;
//# sourceMappingURL=request.js.map