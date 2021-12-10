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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { getLangAlt, newEle, randChar, toggleFocus, toggleHelper, } from './utils.js';
var yaml = jsyaml;
var DEV_MODE = false;
var CFG = {
    lang: 'en',
    cur_member_tab: 'faculty',
    initialized: false,
    res_base_url: DEV_MODE
        ? './_data/'
        : 'https://raw.githubusercontent.com/pangukaitian/pangu/data/',
    photo_base_url: DEV_MODE
        ? './_data/data/images/'
        : 'https://github.com/pangukaitian/pangu/raw/data/data/images/',
    lang_priority: function () {
        var first = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            first[_i] = arguments[_i];
        }
        return __spreadArray(__spreadArray([], first, true), ['en', 'jp', 'cn'], false);
    },
    render_pub_with_marked: false,
};
var _init = function (_, lang) {
    renderPub();
    addEventListener('mouseover', function (event) {
        var ele = event.target;
        if (ele instanceof HTMLElement && ele.classList.contains('author')) {
            var author_token = ele.getAttribute('at');
            if (author_token) {
                var style_ctl = document.getElementById('pub_style');
                style_ctl.innerHTML = "\n                .author[at=\"" + author_token + "\"] {\n                    color: #FFF;\n                    background-color: var(--bg-primary);\n                    border: solid 0.2rem var(--bg-primary);\n                    box-shadow: 0 0.5rem 1rem 0 #2d70ae3f;\n                }";
            }
        }
    });
    toggleHelper('lang_opt', 'selected', function (langOpt) {
        var lang = langOpt.getAttribute('lang');
        if (['en', 'jp', 'cn'].indexOf(lang) == -1) {
            console.warn("one of language buttons has invalid langCode: " + lang);
            return false;
        }
        else {
            CFG.lang = lang;
            render(lang);
            if (!CFG.initialized) {
            }
            return true;
        }
    }, true);
    toggleHelper('tab_btn', 'selected', function (tabBtn) {
        var tab_name = tabBtn.getAttribute('tab');
        if (tab_name == 'repo') {
            window.open('https://sdle2018.github.io/SDLE/V1.1/en/Repository.html', '_blank');
        }
        else {
            var tab = document.getElementById("tab_" + tab_name);
            if (tab) {
                toggleFocus('tab_btn', 'selected', tabBtn);
                toggleFocus('tab', 'show', tab);
            }
            else {
                console.error("tab: " + tab_name + " not found!");
            }
            var param = new URL(window.location.href).searchParams;
            param.set('tab', tab_name);
            window.history.pushState(tab_name, "Pangu Research Lab " + tab_name, '?' + param.toString());
        }
        return true;
    }, false);
    toggleHelper('member_tab_btn', 'selected', function (tabBtn) {
        var title = tabBtn.getAttribute('title');
        CFG.cur_member_tab = title;
        renderMember(CFG.lang, title);
        return true;
    }, true);
    var url = new URL(window.location.href);
    var urlData = {
        tab: url.searchParams.get('tab') || undefined,
        lang: url.searchParams.get('lg') || undefined,
    };
    if (typeof lang == 'undefined') {
        if (typeof (urlData === null || urlData === void 0 ? void 0 : urlData.lang) != 'undefined') {
            CFG.lang = urlData.lang;
        }
        else {
            var locale = window.navigator.language;
            if (locale.substr(0, 2) == 'en') {
                CFG.lang = 'en';
            }
            else if (locale.substr(0, 2) == 'jp') {
                CFG.lang = 'jp';
            }
        }
    }
    else {
        CFG.lang = lang;
    }
    var langBtn = document.querySelector(".lang_opt[lang=\"" + CFG.lang + "\"]");
    langBtn.click();
    console.log('page initialized.');
    CFG.initialized = true;
    if (typeof (urlData === null || urlData === void 0 ? void 0 : urlData.tab) != 'undefined') {
        var tabBtn = document.querySelector(".tab_btn[tab=" + urlData.tab + "]");
        tabBtn.click();
    }
};
var render = function (lang) {
    var langFont = document.getElementById('lang_font');
    var pageFontCSS = function (font) {
        return "* { font-family: " + font + ", \u30E1\u30A4\u30EA\u30AA, Meiryo, sans-serif; }";
    };
    if (['cn', 'jp'].indexOf(lang) != -1) {
        langFont.innerHTML = pageFontCSS("'Noto Sans JP'");
    }
    else {
        langFont.innerHTML = pageFontCSS("'Lato'");
    }
    renderlangTags(CFG.lang);
    renderHome(CFG.lang);
    renderNews(CFG.lang);
    renderMember(CFG.lang, CFG.cur_member_tab);
    renderIntro(CFG.lang);
    renderContact(CFG.lang);
};
var getRemote = function (r, p, options) { return __awaiter(void 0, void 0, void 0, function () {
    var lang, f;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (r == 'lang') {
                    lang = options === null || options === void 0 ? void 0 : options.lang;
                    if (typeof lang == 'undefined') {
                        p = './lang/' + p;
                    }
                    else {
                        p = "./lang/" + lang + "/" + p;
                    }
                }
                else if (r == 'data') {
                    p = CFG.res_base_url + 'data/' + p;
                }
                else {
                    throw Error('unknown root: ' + r);
                }
                return [4, fetch(p, {
                        method: 'GET',
                    })];
            case 1:
                f = _a.sent();
                if (!f.ok) return [3, 3];
                return [4, f.text()];
            case 2: return [2, _a.sent()];
            case 3: throw Error('failed to load: ' + p);
        }
    });
}); };
var renderMember = function (lang, type) { return __awaiter(void 0, void 0, void 0, function () {
    var txt, data, displayTitles, pending, ctr, _loop_1, _i, pending_1, title;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                lang = lang !== null && lang !== void 0 ? lang : 'en';
                return [4, getRemote('data', 'members.yaml')];
            case 1:
                txt = _b.sent();
                data = yaml.load(txt);
                displayTitles = {
                    faculty: ['sensei'],
                    student: ['phd', 'master', 'ugrd', 'research'],
                    alumni: [],
                };
                Object.keys(data.titles).forEach(function (t) {
                    if (t.substr(0, 8) == 'grad_yr_') {
                        displayTitles.alumni.push(t);
                    }
                });
                pending = displayTitles[type];
                ctr = document.getElementById('member_tab');
                ctr.innerHTML = '';
                _loop_1 = function (title) {
                    var members = data.members.filter(function (m) { return m.title == title; });
                    var titleFormal = data.titles[title];
                    var ht = document.createElement('ht');
                    ht.innerHTML = getLangAlt(titleFormal, [lang, 'en', 'jp']);
                    ctr.appendChild(ht);
                    var grp = newEle('div', ['group']);
                    for (var _c = 0, members_1 = members; _c < members_1.length; _c++) {
                        var member = members_1[_c];
                        var memberInf = newEle('div', ['photo_ctr']);
                        var memberPhoto = newEle('div', ['photo'], {
                            style: "background-image: url(\"" + (CFG.photo_base_url + ((_a = member.pic_url) !== null && _a !== void 0 ? _a : 'undefined.png')) + "\");",
                        });
                        var memberDetail = newEle('div', ['details']);
                        var detailEmpty = newEle('div', ['empty']);
                        var detailAlways = newEle('div', ['always']);
                        var detailOthers = newEle('div', ['others']);
                        detailAlways.appendChild(newEle('p', ['name'], {}, getLangAlt(member.name, CFG.lang_priority(lang, 'native'))));
                        var title_1 = void 0;
                        if (typeof member.title_alt != 'undefined') {
                            if (typeof member.title_alt.prev != 'undefined') {
                                title_1 = getLangAlt(data.titles[member.title_alt.prev], CFG.lang_priority(lang));
                            }
                            else {
                                title_1 = getLangAlt(member.title_alt, CFG.lang_priority(lang));
                            }
                        }
                        else {
                            title_1 = getLangAlt(data.titles[title_1], CFG.lang_priority(lang));
                        }
                        if (typeof title_1 != 'undefined') {
                            detailOthers.appendChild(newEle('p', ['title'], {}, title_1));
                        }
                        if ([member.url, member.email, member.github].filter(function (e) { return typeof e != 'undefined'; }).length) {
                            var linkCtr = newEle('div', ['link_ctr'], {});
                            if (typeof member.url != 'undefined') {
                                var a = newEle('a', ['icon', 'url'], {
                                    target: '_blank',
                                    href: member.url,
                                });
                                a.appendChild(newEle('div'));
                                linkCtr.appendChild(a);
                            }
                            if (typeof member.email != 'undefined') {
                                var a = newEle('a', ['icon', 'email'], {
                                    href: 'mailto:' + member.email,
                                });
                                a.appendChild(newEle('div'));
                                linkCtr.appendChild(a);
                            }
                            if (typeof member.github != 'undefined') {
                                var a = newEle('a', ['icon', 'github'], {
                                    target: '_blank',
                                    href: member.github,
                                });
                                a.appendChild(newEle('div'));
                                linkCtr.appendChild(a);
                            }
                            if (typeof member.scholar != 'undefined') {
                                var a = newEle('a', ['icon', 'scholar'], {
                                    target: '_blank',
                                    href: member.scholar,
                                });
                                a.appendChild(newEle('div'));
                                linkCtr.appendChild(a);
                            }
                            detailOthers.appendChild(linkCtr);
                        }
                        memberDetail.appendChild(detailEmpty);
                        memberDetail.appendChild(detailAlways);
                        memberDetail.appendChild(detailOthers);
                        memberInf.appendChild(memberPhoto);
                        memberInf.appendChild(memberDetail);
                        grp.appendChild(memberInf);
                    }
                    ctr.appendChild(grp);
                };
                for (_i = 0, pending_1 = pending; _i < pending_1.length; _i++) {
                    title = pending_1[_i];
                    _loop_1(title);
                }
                return [2];
        }
    });
}); };
var renderlangTags = function (lang) { return __awaiter(void 0, void 0, void 0, function () {
    var txt, data, _i, _a, _b, k, v, lt;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                lang = lang !== null && lang !== void 0 ? lang : 'en';
                return [4, getRemote('lang', lang + "/tags.yaml")];
            case 1:
                txt = _c.sent();
                data = yaml.load(txt);
                for (_i = 0, _a = Object.entries(data); _i < _a.length; _i++) {
                    _b = _a[_i], k = _b[0], v = _b[1];
                    lt = document.querySelectorAll("[lt=\"" + k + "\"]");
                    if (lt.length > 0) {
                        lt[0].innerHTML = v;
                    }
                    else {
                        console.warn("lang-tag " + k + " with value \"" + v + "\" not found in page");
                    }
                }
                return [2];
        }
    });
}); };
var renderHome = function (lang) { return __awaiter(void 0, void 0, void 0, function () {
    var txt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lang = lang !== null && lang !== void 0 ? lang : 'en';
                return [4, getRemote('lang', lang + "/home.md")];
            case 1:
                txt = _a.sent();
                document.getElementById('intro').innerHTML = marked.parse(txt);
                return [2];
        }
    });
}); };
var renderNews = function (lang) { return __awaiter(void 0, void 0, void 0, function () {
    var txt, news, news_ctr, _i, news_1, n, news_div;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lang = lang !== null && lang !== void 0 ? lang : 'en';
                return [4, getRemote('data', "news.json")];
            case 1:
                txt = _a.sent();
                news = JSON.parse(txt);
                news_ctr = document.getElementById('news_ctr');
                news_ctr.innerHTML = '';
                for (_i = 0, news_1 = news; _i < news_1.length; _i++) {
                    n = news_1[_i];
                    news_div = document.createElement('div');
                    news_div.classList.add('notif');
                    news_div.innerHTML = n.content;
                    if (n.is_new) {
                        news_div.innerHTML += "<span class=\"new\">NEW</span>";
                    }
                    news_ctr.appendChild(news_div);
                }
                return [2];
        }
    });
}); };
var renderIntro = function (lang) { return __awaiter(void 0, void 0, void 0, function () {
    var txt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lang = lang !== null && lang !== void 0 ? lang : 'en';
                return [4, getRemote('lang', lang + "/intro.md")];
            case 1:
                txt = _a.sent();
                document.getElementById('tab_intro').innerHTML = marked.parse(txt);
                return [2];
        }
    });
}); };
var renderPub = function () { return __awaiter(void 0, void 0, void 0, function () {
    var txt, data, pubCtr, ctrStr, tokens, _i, data_1, pub, authorBtns, separators, authorHtml, _a, _b, author, sep, li;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4, getRemote('data', "publications.yaml")];
            case 1:
                txt = _d.sent();
                data = yaml.load(txt);
                pubCtr = document.getElementById('tab_pub');
                ctrStr = '';
                tokens = {};
                for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                    pub = data_1[_i];
                    authorBtns = [];
                    separators = [' and ', ''];
                    authorHtml = '';
                    for (_a = 0, _b = pub.authors; _a < _b.length; _a++) {
                        author = _b[_a];
                        if (Object.keys(tokens).indexOf(author) == -1) {
                            tokens[author] = randChar(4, 36);
                        }
                        authorBtns.push("<span class=\"author\" at=\"" + tokens[author] + "\">" + author + "</span>");
                    }
                    while (authorBtns.length) {
                        sep = (_c = separators.pop()) !== null && _c !== void 0 ? _c : ', ';
                        authorHtml = authorBtns.pop() + sep + authorHtml;
                    }
                    if (CFG.render_pub_with_marked) {
                        ctrStr += ['- ' + authorHtml, pub.title, pub.publish, '<hr>']
                            .map(function (t) { return t + '\n\n'; })
                            .join('  ');
                    }
                    else {
                        li = newEle('div', ['spub'], {});
                        li.appendChild(newEle('p', [], {}, authorHtml));
                        li.appendChild(newEle('p', [], {}, pub.title));
                        li.appendChild(newEle('p', [], {}, pub.publish));
                        li.appendChild(newEle('hr'));
                        pubCtr.appendChild(li);
                    }
                }
                if (CFG.render_pub_with_marked) {
                    pubCtr.innerHTML = marked.parse(ctrStr);
                }
                return [2];
        }
    });
}); };
var renderContact = function (lang) { return __awaiter(void 0, void 0, void 0, function () {
    var txt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lang = lang !== null && lang !== void 0 ? lang : 'en';
                return [4, getRemote('lang', lang + "/contact.md")];
            case 1:
                txt = _a.sent();
                document.getElementById('tab_contact').innerHTML = marked.parse(txt);
                return [2];
        }
    });
}); };
window.onload = _init;
