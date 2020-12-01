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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var events_1 = __importDefault(require("events"));
var eventEmitter = new events_1.default.EventEmitter();
var string_similarity_1 = __importDefault(require("string-similarity"));
var error_1 = __importDefault(require("../../error"));
var regex_1 = __importDefault(require("../regex"));
var request_1 = __importDefault(require("../request"));
var jsdom_1 = require("jsdom");
var Shopify = /** @class */ (function () {
    function Shopify(options) {
        if (!options.delay || options.delay < 1000)
            options.delay = 1000;
        this.request = new request_1.default({
            hostname: regex_1.default.getHostname(options.product.url),
            proxy: options.proxy
        });
        options.product.handle = regex_1.default.getEndpoint(options.product.url);
        this.options = options;
    }
    Shopify.prototype.setOptions = function (options) {
        if (options.delay && options.delay < 1000)
            options.delay = 1000;
        if (options.proxy)
            this.request.proxy = options.proxy;
        if (options.password)
            eventEmitter.emit('password', options.password);
        if (options.product && options.product.url) {
            this.request.hostname = regex_1.default.getHostname(options.product.url);
            this.options.product.handle = regex_1.default.getEndpoint(options.product.url);
        }
        lodash_1.default.merge(this.options, options);
    };
    Shopify.prototype.locationURL = function (location) {
        if (location == 'contact_information' || location == 'shipping_method' || location == 'payment_method')
            return "/checkout?step=" + location;
        return '\/' + location;
    };
    Shopify.prototype.validateRequest = function (location, result) {
        return __awaiter(this, void 0, void 0, function () {
            var url, endpoint, dom, _a, stepTag, errorCode;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        url = (result instanceof jsdom_1.JSDOM) ? result.window.location.pathname : result.url;
                        if (!(location == 'contact_information' || location == 'shipping_method' || location == 'payment_method')) return [3 /*break*/, 4];
                        if (!(result instanceof jsdom_1.JSDOM)) return [3 /*break*/, 1];
                        _a = result;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.request.dom({ content: result.body })];
                    case 2:
                        _a = _b.sent();
                        _b.label = 3;
                    case 3:
                        dom = _a;
                        stepTag = dom.window.document.body.querySelector('[data-step]');
                        if (stepTag)
                            endpoint = stepTag.getAttribute('data-step');
                        else
                            endpoint = regex_1.default.getEndpoint(url);
                        return [3 /*break*/, 5];
                    case 4:
                        endpoint = regex_1.default.getEndpoint(url);
                        _b.label = 5;
                    case 5:
                        if (location != endpoint) {
                            errorCode = 0;
                            if (endpoint == 'login')
                                errorCode = 1;
                            else if (endpoint == 'checkpoint')
                                errorCode = 2;
                            throw new error_1.default({ code: errorCode, message: "Expected " + location + " redirected to " + endpoint });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Shopify.prototype.launch = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addToCart()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.checkout()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Shopify.prototype.onActionRequired = function (action, info) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Shopify.prototype.addToCart = function () {
        return __awaiter(this, void 0, void 0, function () {
            var variant, product, variant, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 16];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 15]);
                        if (!this.options.product.handle) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.findVariant(this.options.product.handle, this.options.product.sizes)];
                    case 2:
                        variant = _a.sent();
                        return [4 /*yield*/, this.submitProduct(this.options.product.handle, variant)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        if (!this.options.product.keywords) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.searchKeywords(this.options.product.keywords)];
                    case 5:
                        product = _a.sent();
                        return [4 /*yield*/, this.findVariant(product.handle, this.options.product.sizes)];
                    case 6:
                        variant = _a.sent();
                        return [4 /*yield*/, this.submitProduct(product.handle, variant)];
                    case 7: return [2 /*return*/, _a.sent()];
                    case 8: return [3 /*break*/, 15];
                    case 9:
                        error_2 = _a.sent();
                        console.log(error_2.message);
                        if (!(error_2.code == 403)) return [3 /*break*/, 10];
                        throw new Error(error_2.message);
                    case 10:
                        if (!(error_2.code == 401)) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.submitPassword(this.options.password)];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 12: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.options.delay); })];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14: return [3 /*break*/, 15];
                    case 15: return [3 /*break*/, 0];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    Shopify.prototype.checkout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 6];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, this.submitContact(this.options.contact)];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        error_3 = _a.sent();
                        console.log(error_3.message);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.options.delay); })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 0];
                    case 6:
                        if (!true) return [3 /*break*/, 12];
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 11]);
                        return [4 /*yield*/, this.submitShipping(response.body)];
                    case 8:
                        response = _a.sent();
                        return [3 /*break*/, 12];
                    case 9:
                        error_4 = _a.sent();
                        console.log(error_4.message);
                        if (error_4.code == 3)
                            delete response.body;
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.options.delay); })];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 6];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    Shopify.prototype.submitPassword = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            var dom, password_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!password) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.request.dom({ url: this.locationURL('password') })];
                    case 1:
                        dom = _a.sent();
                        return [4 /*yield*/, this.validateRequest('password', dom)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.request.submitForm(dom, '[action="/password"]', function (formValues) { return formValues.password = password; })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, new Promise(function (resolve) {
                            eventEmitter.once('password', function (password) { return resolve(password); });
                            _this.onActionRequired('password');
                        })];
                    case 5:
                        password_1 = _a.sent();
                        return [4 /*yield*/, this.submitPassword(password_1)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Shopify.prototype.searchKeywords = function (keywords) {
        return __awaiter(this, void 0, void 0, function () {
            var body, product;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request.get("/search/suggest.json?q=" + encodeURI(keywords) + "&resources[type]=product&resources[limit]=1&resources[options][unavailable_products]=hide")];
                    case 1:
                        body = (_a.sent()).body;
                        product = JSON.parse(body).resources.results.products[0];
                        if (product == undefined)
                            throw new error_1.default({ code: 0, message: 'Keywords not found' });
                        return [2 /*return*/, {
                                name: product.title,
                                price: product.price,
                                image: product.image,
                                handle: product.handle
                            }];
                }
            });
        });
    };
    Shopify.prototype.findVariant = function (handle, sizes) {
        return __awaiter(this, void 0, void 0, function () {
            var body, variants, variant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request.get("/products/" + handle + ".js")];
                    case 1:
                        body = (_a.sent()).body;
                        variants = JSON.parse(body).variants;
                        variants = variants.filter(function (variant) { return variant.available; });
                        if (sizes)
                            variant = variants.find(function (variant) { return sizes.includes(variant.option1) || sizes.includes(variant.option2) || sizes.includes(variant.option3); });
                        else
                            variant = variants[0];
                        if (variant)
                            return [2 /*return*/, variant];
                        else
                            throw new error_1.default({ code: 0, message: 'Not available' });
                        return [2 /*return*/];
                }
            });
        });
    };
    Shopify.prototype.submitProduct = function (handle, variant) {
        return __awaiter(this, void 0, void 0, function () {
            var dom;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.request.dom({ url: this.locationURL("products/" + handle) })];
                    case 1:
                        dom = _a.sent();
                        return [4 /*yield*/, this.validateRequest(handle, dom)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.request.submitForm(dom, '[action="/cart/add"]', function (formValues) { return formValues.id = variant.id; })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Shopify.prototype.submitContact = function (contact) {
        return __awaiter(this, void 0, void 0, function () {
            var values, dom;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        values = {
                            'checkout[email]': contact.email,
                            'checkout[email_or_phone]': contact.email,
                            'checkout[shipping_address][first_name]': contact.firstName,
                            'checkout[shipping_address][last_name]': contact.lastName,
                            'checkout[shipping_address][company]': contact.company,
                            'checkout[shipping_address][city]': contact.city,
                            'checkout[shipping_address][zip]': contact.zip,
                            'checkout[shipping_address][phone]': contact.phone
                        };
                        return [4 /*yield*/, this.request.dom({ url: this.locationURL('contact_information'), runScripts: 'outside-only' })];
                    case 1:
                        dom = _a.sent();
                        return [4 /*yield*/, this.validateRequest('contact_information', dom)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.request.submitForm(dom, '[data-customer-information-form]', function (formValues) { return __awaiter(_this, void 0, void 0, function () {
                                var secondAddress, scriptTag, body, country, state, stateCode, name_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            secondAddress = dom.window.document.body.querySelector('[name="checkout[shipping_address][address2]"]');
                                            if (secondAddress) {
                                                formValues['checkout[shipping_address][address1]'] = contact.address1;
                                                formValues['checkout[shipping_address][address2]'] = contact.address2;
                                            }
                                            else
                                                formValues['checkout[shipping_address][address1]'] = contact.address1 + " " + contact.address2;
                                            scriptTag = dom.window.document.querySelector('script[src*="checkout_countries"]');
                                            return [4 /*yield*/, this.request.get(scriptTag.src)];
                                        case 1:
                                            body = (_a.sent()).body;
                                            dom.window.eval(body);
                                            country = string_similarity_1.default.findBestMatch(contact.country, Object.keys(dom.window.Countries)).bestMatch.target;
                                            formValues['checkout[shipping_address][country]'] = country;
                                            state = string_similarity_1.default.findBestMatch(contact.state, Object.keys(dom.window.Countries[country].provinces)).bestMatch.target;
                                            stateCode = dom.window.Countries[country].provinces[state].code;
                                            formValues['checkout[shipping_address][province]'] = stateCode;
                                            for (name_1 in formValues)
                                                if (values[name_1])
                                                    formValues[name_1] = values[name_1];
                                            if (formValues['g-recaptcha-response']) { }
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, '[data-honeypot]')];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Shopify.prototype.submitShipping = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            var dom, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!content) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.request.dom({ content: content })];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.request.dom({ url: this.locationURL('shipping_method') })];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        dom = _a;
                        return [4 /*yield*/, this.validateRequest('shipping_method', dom)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this.request.submitForm(dom, '[data-shipping-method-form]', function (formValues) {
                                if (!formValues['checkout[shipping_rate][id]'])
                                    throw new error_1.default({ code: 3, message: 'Missing shipping rate' });
                            })];
                    case 6: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return Shopify;
}());
exports.default = Shopify;
module.exports = Shopify;
//# sourceMappingURL=shopify.js.map