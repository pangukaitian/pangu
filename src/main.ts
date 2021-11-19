// import { marked } from 'marked'
// import * as jsyaml from 'js-yaml'
import {
    getLangAlt,
    newEle,
    randChar,
    toggleFocus,
    toggleHelper,
} from './utils.js'

// @ts-ignore
const yaml = jsyaml

type News = {
    content: string
    is_new: boolean
    url?: string
}

type SupportedLang = 'en' | 'jp' | 'cn'

type SimpleTitle = 'faculty' | 'student' | 'alumni'
type MemberTitle = 'sensei' | 'phd' | 'master' | 'ugrd' | 'research'

type MemberInf = {
    name: {
        native?: string
        en?: string
        jp?: string
    }
    title: MemberTitle
    title_alt?: {
        en?: string
        jp?: string
        prev?: SimpleTitle
    }
    url?: string
    pic_url?: string
    details?: {
        en?: string
        jp?: string
    }
}

type MemberRes = {
    titles: {
        [key in MemberTitle]: {
            en: string
            jp: string
        }
    }
    members: MemberInf[]
}

type PubInf = {
    title: string
    authors: string[]
    publish: string
}

const DEV_MODE: boolean = false

const CFG = {
    lang: 'en',
    cur_member_tab: 'faculty',
    initialized: false,
    res_base_url: DEV_MODE
        ? './_data/'
        : 'https://raw.githubusercontent.com/pangukaitian/pangu/data/',
    photo_base_url: DEV_MODE
        ? './_data/data/images/'
        : 'https://github.com/pangukaitian/pangu/raw/data/data/images/',
    lang_priority: (...first: string[]) => {
        return [...first, 'en', 'jp', 'cn']
    },
} as {
    lang: SupportedLang
    cur_member_tab: SimpleTitle
    initialized: boolean
    res_base_url: string
    photo_base_url: string
    lang_priority: (...first: string[]) => string[]
}

const _init = (_: any, lang?: SupportedLang) => {
    renderPub()
    addEventListener('mouseover', (event) => {
        const ele = event.target
        if (ele instanceof HTMLElement && ele.classList.contains('author')) {
            const author_token = ele.getAttribute('at')
            if (author_token) {
                const style_ctl = document.getElementById('pub_style')
                style_ctl.innerHTML = `
                .author[at="${author_token}"] {
                    color: #FFF;
                    background-color: var(--bg-primary);
                    border: solid 0.2rem var(--bg-primary);
                    box-shadow: 0 0.5rem 1rem 0 #2d70ae3f;
                }`
            }
        }
    })
    toggleHelper(
        'lang_opt',
        'selected',
        (langOpt) => {
            // @ts-ignore
            const lang: SupportedLang = langOpt.getAttribute('lang')
            if (['en', 'jp', 'cn'].indexOf(lang) == -1) {
                console.warn(
                    `one of language buttons has invalid langCode: ${lang}`
                )
                return false
            } else {
                CFG.lang = lang
                render(lang)
                if (!CFG.initialized) {
                    // TODO:
                    // const url = new URL(window.location.href)
                    // url.searchParams.append('lg', lang)
                    // url.search
                }
                return true
            }
        },
        true
    )
    toggleHelper(
        'tab_btn',
        'selected',
        (tabBtn) => {
            const tab_name = tabBtn.getAttribute('tab')
            if (tab_name == 'repo') {
                window.open(
                    'https://sdle2018.github.io/SDLE/V1.1/en/Repository.html',
                    '_blank'
                )
            } else {
                const tab = document.getElementById(`tab_${tab_name}`)
                if (tab) {
                    toggleFocus('tab_btn', 'selected', tabBtn)
                    toggleFocus('tab', 'show', tab)
                } else {
                    console.error(`tab: ${tab_name} not found!`)
                }
                const param = new URL(window.location.href).searchParams
                param.set('tab', tab_name)
                window.history.pushState(
                    tab_name,
                    `Pangu Research Lab ${tab_name}`,
                    '?' + param.toString()
                )
            }
            return true
        },
        false
    )
    toggleHelper(
        'member_tab_btn',
        'selected',
        (tabBtn) => {
            // @ts-ignore
            const title: SimpleTitle = tabBtn.getAttribute('title')
            CFG.cur_member_tab = title
            renderMember(CFG.lang, title)
            return true
        },
        true
    )

    const url = new URL(window.location.href)
    const urlData = {
        tab: url.searchParams.get('tab') || undefined,
        lang: url.searchParams.get('lg') || undefined,
    } as Partial<{
        tab: string
        lang: SupportedLang
    }>
    if (typeof lang == 'undefined') {
        if (typeof urlData?.lang != 'undefined') {
            CFG.lang = urlData.lang
        } else {
            const locale = window.navigator.language
            if (locale.substr(0, 2) == 'en') {
                CFG.lang = 'en'
            } else if (locale.substr(0, 2) == 'jp') {
                CFG.lang = 'jp'
            }
        }
    } else {
        CFG.lang = lang
    }
    const langBtn: HTMLElement = document.querySelector(
        `.lang_opt[lang="${CFG.lang}"]`
    )
    langBtn.click()
    console.log('page initialized.')
    CFG.initialized = true
    if (typeof urlData?.tab != 'undefined') {
        const tabBtn: HTMLElement = document.querySelector(
            `.tab_btn[tab=${urlData.tab}]`
        )
        tabBtn.click()
    }
}

const render = (lang?: SupportedLang) => {
    renderlangTags(CFG.lang)
    renderHome(CFG.lang)
    renderNews(CFG.lang)
    renderMember(CFG.lang, CFG.cur_member_tab)
    renderIntro(CFG.lang)
    renderContact(CFG.lang)
}

const getRemote = async (
    r: 'data' | 'lang',
    p: string,
    options?: { lang: SupportedLang }
): Promise<string> => {
    if (r == 'lang') {
        const lang = options?.lang
        if (typeof lang == 'undefined') {
            p = './lang/' + p
        } else {
            p = `./lang/${lang}/` + p
        }
    } else if (r == 'data') {
        p = CFG.res_base_url + 'data/' + p
    } else {
        throw Error('unknown root: ' + r)
    }
    const f = await fetch(p, {
        method: 'GET',
    })
    if (f.ok) {
        return await f.text()
    } else {
        throw Error('failed to load: ' + p)
    }
}

const renderMember = async (
    lang: SupportedLang,
    type: 'faculty' | 'student' | 'alumni'
) => {
    lang = lang ?? 'en'
    const txt = await getRemote('data', 'members.yaml')
    const data = yaml.load(txt) as MemberRes

    const displayTitles = {
        faculty: ['sensei'],
        student: ['phd', 'master', 'ugrd', 'research'],
        alumni: [],
    } as {
        [key in 'faculty' | 'student' | 'alumni']: MemberTitle[]
    }
    Object.keys(data.titles).forEach((t) => {
        if (t.substr(0, 8) == 'grad_yr_') {
            // @ts-ignore
            displayTitles.alumni.push(t)
        }
    })
    const pending = displayTitles[type]

    const ctr = document.getElementById('member_tab')
    ctr.innerHTML = ''
    for (const title of pending) {
        const members = data.members.filter((m) => m.title == title)
        const titleFormal = data.titles[title]
        const ht = document.createElement('ht')
        ht.innerHTML = getLangAlt(titleFormal, [lang, 'en', 'jp'])
        ctr.appendChild(ht)
        const grp = newEle('div', ['group'])
        for (const member of members) {
            const memberInf = newEle('div', ['photo_ctr'])
            const memberPhoto = newEle('div', ['photo'], {
                style: `background-image: url("${
                    CFG.photo_base_url + (member.pic_url ?? 'undefined.png')
                }");`,
            })
            const memberDetail = newEle('div', ['details'])
            const detailEmpty = newEle('div', ['empty'])
            const detailAlways = newEle('div', ['always'])
            const detailOthers = newEle('div', ['others'])
            detailAlways.appendChild(
                newEle(
                    'p',
                    ['name'],
                    {},
                    getLangAlt(member.name, CFG.lang_priority(lang, 'native'))
                )
            )
            let title: string | undefined
            if (typeof member.title_alt != 'undefined') {
                if (typeof member.title_alt.prev != 'undefined') {
                    title = getLangAlt(
                        data.titles[member.title_alt.prev],
                        CFG.lang_priority(lang)
                    )
                } else {
                    title = getLangAlt(
                        member.title_alt,
                        CFG.lang_priority(lang)
                    )
                }
            } else {
                title = getLangAlt(data.titles[title], CFG.lang_priority(lang))
            }
            if (typeof title != 'undefined') {
                detailOthers.appendChild(newEle('p', ['title'], {}, title))
            }
            if (typeof member.url != 'undefined') {
                const linkCtr = newEle('div', ['link_ctr'], {})
                const a = newEle('a', ['link'], {
                    target: '_blank',
                    href: member.url,
                })
                a.appendChild(newEle('div'))
                linkCtr.appendChild(a)
                detailOthers.appendChild(linkCtr)
            }
            memberDetail.appendChild(detailEmpty)
            memberDetail.appendChild(detailAlways)
            memberDetail.appendChild(detailOthers)
            memberInf.appendChild(memberPhoto)
            memberInf.appendChild(memberDetail)
            grp.appendChild(memberInf)
        }
        ctr.appendChild(grp)
    }
}

const renderlangTags = async (lang: SupportedLang) => {
    lang = lang ?? 'en'
    const txt = await getRemote('lang', `${lang}/tags.yaml`)
    const data = yaml.load(txt)
    for (const [k, v] of Object.entries(data)) {
        const lt = document.querySelectorAll(`[lt="${k}"]`)
        if (lt.length > 0) {
            lt[0].innerHTML = v
        } else {
            console.warn(`lang-tag ${k} with value "${v}" not found in page`)
        }
    }
}

const renderHome = async (lang: SupportedLang) => {
    lang = lang ?? 'en'
    const txt = await getRemote('lang', `${lang}/home.md`)
    // @ts-ignore
    document.getElementById('intro').innerHTML = marked.parse(txt)
}

const renderNews = async (lang: SupportedLang) => {
    lang = lang ?? 'en'
    const txt = await getRemote('data', `news.json`)
    const news: News[] = JSON.parse(txt)
    const news_ctr = document.getElementById('news_ctr')
    news_ctr.innerHTML = ''
    for (const n of news) {
        const news_div = document.createElement('div')
        news_div.classList.add('notif')
        news_div.innerHTML = n.content
        if (n.is_new) {
            news_div.innerHTML += `<span class="new">NEW</span>`
        }
        news_ctr.appendChild(news_div)
    }
}

const renderIntro = async (lang: SupportedLang) => {
    lang = lang ?? 'en'
    const txt = await getRemote('lang', `${lang}/intro.md`)
    // @ts-ignore
    document.getElementById('tab_intro').innerHTML = marked.parse(txt)
}

const renderPub = async () => {
    const txt = await getRemote('data', `publications.yaml`)
    const data = yaml.load(txt) as PubInf[]
    let ctr_str: string = ''
    const tokens: Record<string, string> = {}
    for (const pub of data) {
        const author_btns: string[] = []
        const separators = [' and ', '']
        let author_html = ''
        for (const author of pub.authors) {
            if (Object.keys(tokens).indexOf(author) == -1) {
                tokens[author] = randChar(4, 36)
            }
            author_btns.push(
                `<span class="author" at="${tokens[author]}">${author}</span>`
            )
        }
        while (author_btns.length) {
            const sep = separators.pop() ?? ', '
            author_html = author_btns.pop() + sep + author_html
        }
        ctr_str += ['- ' + author_html, pub.title, pub.publish, '<hr>']
            .map((t) => t + '\n\n')
            .join('  ')
    }
    // @ts-ignore
    document.getElementById('tab_pub').innerHTML = marked.parse(ctr_str)
}

const renderContact = async (lang: SupportedLang) => {
    lang = lang ?? 'en'
    const txt = await getRemote('lang', `${lang}/contact.md`)
    // @ts-ignore
    document.getElementById('tab_contact').innerHTML = marked.parse(txt)
}

window.onload = _init
