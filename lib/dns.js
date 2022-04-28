"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.DnsServer = exports.withServerListening = exports.DnsResolver = void 0;
var dgram = require("dgram");
var debug_1 = require("debug");
var packet = require("native-dns-packet");
var loginfo = (0, debug_1.default)("didapp:dns:info");
// const logdebug = debug("didapp:dns:debug");
// const logquery = debug("didapp:dns:query");
var logerror = (0, debug_1.default)("didapp:dns:error");
function DnsResolver() {
    var resolver = function (_request) {
        return "127.0.0.1";
    };
    return resolver;
}
exports.DnsResolver = DnsResolver;
function withServerListening(server, port, host, onceListening) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, stopListening, address;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, server.listen(port, host)];
                case 1:
                    _a = _b.sent(), stopListening = _a.stop, address = _a.address;
                    return [4 /*yield*/, onceListening({ address: address })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, stopListening()];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.withServerListening = withServerListening;
var DnsRecordTypeEnum = {
    1: "A",
    2: "NS",
    5: "CNAME",
    6: "SOA",
    12: "PTR",
    15: "MX",
    16: "TXT",
    28: "AAAA",
};
var DnsServer = /** @class */ (function () {
    function DnsServer() {
    }
    DnsServer.prototype.createAnswer = function (query) {
        var answer = __assign(__assign({}, query), { answer: [
                {
                    name: query.question[0].name,
                    type: 1,
                    class: 1,
                    ttl: 30,
                    address: "127.0.0.1",
                },
            ] });
        var buf = Buffer.alloc(4096);
        var wrt = packet.write(buf, answer);
        var res = buf.slice(0, wrt);
        return res;
    };
    DnsServer.prototype.listen = function (port, host) {
        var _this = this;
        var socket = dgram.createSocket("udp4");
        socket.on("error", function (err) {
            logerror("udp socket error");
            logerror(err);
        });
        socket.on("message", function (message, rinfo) {
            var query = packet.parse(message);
            var domain = query.question[0].name;
            var type = query.question[0].type;
            loginfo("socket got message", { domain: domain, type: type });
            var res = _this.createAnswer(query);
            socket.send(res, 0, res.length, rinfo.port, rinfo.address);
        });
        socket.bind(port, host);
        var stop = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                socket.close();
                return [2 /*return*/];
            });
        }); };
        return new Promise(function (resolve, _reject) {
            socket.on("listening", function () {
                loginfo("we are up and listening at %s on %s", socket.address());
                var addressInfo = socket.address();
                var address = "".concat(addressInfo.address, ":").concat(addressInfo.port);
                resolve({ address: address, stop: stop });
            });
        });
    };
    return DnsServer;
}());
exports.DnsServer = DnsServer;
