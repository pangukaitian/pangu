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
var newEle = function (tagName, classes, attr, inner) {
    if (classes === void 0) { classes = []; }
    if (attr === void 0) { attr = {}; }
    var ele = document.createElement(tagName);
    classes.forEach(function (cls) {
        ele.classList.add(cls);
    });
    for (var _i = 0, _a = Object.entries(attr); _i < _a.length; _i++) {
        var _b = _a[_i], k = _b[0], v = _b[1];
        ele.setAttribute(k, v);
    }
    if (typeof inner != 'undefined') {
        ele.innerHTML = inner;
    }
    return ele;
};
var toggleFocus = function (className, focusClassName, focusTarget) {
    Array.from(document.querySelectorAll("." + className + "." + focusClassName)).forEach(function (prev) {
        prev.classList.remove(focusClassName);
    });
    focusTarget.classList.add(focusClassName);
};
var toggleHelper = function (className, focusClassName, click_cb, autoToggleFocus) {
    if (autoToggleFocus === void 0) { autoToggleFocus = true; }
    Array.from(document.getElementsByClassName(className)).forEach(function (target) {
        target.addEventListener('click', function (event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (target.classList.contains(focusClassName))
                            return [2];
                        return [4, click_cb(target, event)];
                    case 1:
                        if ((_a.sent()) && autoToggleFocus) {
                            toggleFocus(className, focusClassName, target);
                        }
                        return [2];
                }
            });
        }); });
    });
};
var getLangAlt = function (txtObj, priority) {
    if (typeof txtObj == 'undefined')
        return undefined;
    var pri = priority.filter(function (val, idx, arr) {
        return arr.indexOf(val) == idx;
    });
    var res;
    while (pri.length) {
        res = txtObj[pri.shift()];
        if (typeof res != 'undefined')
            break;
    }
    return res;
};
export { newEle, toggleFocus, toggleHelper, getLangAlt };
