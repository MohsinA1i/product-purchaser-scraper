"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Regex = /** @class */ (function () {
    function Regex() {
    }
    Regex.prototype.getHostname = function (url) {
        var match = url.match(/(?:http[s]?:\/\/)?([^\/]+)/);
        if (match)
            return match[1];
        return '';
    };
    Regex.prototype.getEndpoint = function (url) {
        var match = url.match(/(?<!https:\/)\/[^\/]+$/);
        if (match) {
            match = match[0].match(/\/([^?]+)/);
            if (match)
                return match[1];
        }
        return '';
    };
    return Regex;
}());
exports.default = new Regex();
//# sourceMappingURL=regex.js.map