import * as fs from 'fs'
import { JSDOM } from 'jsdom'
import * as yaml from 'js-yaml'

type Publication = {
    title: string
    url?: string
    authors: string[]
    publish: string
}

const node_iter = <T extends Element>(
    nodes: NodeListOf<T>,
    cb: (value: T, index: number, array: T[]) => void
) => {
    Array.from(nodes).forEach(cb)
}

const run = async (): Promise<void> => {
    const doc = fs.readFileSync('./pub.html', { encoding: 'utf-8' })
    const dom = new JSDOM(doc)
    const res = [] as Publication[]
    const pubs = dom.window.document.querySelectorAll(
        '#publications > * li'
    ) as NodeListOf<HTMLElement>
    node_iter(pubs, (pub) => {
        if (pub.textContent.replace(/\s/g, '')) {
            node_iter(pub.querySelectorAll('a'), (anchor) => {
                const url = anchor.getAttribute('href')
                anchor.replaceWith(
                    `[${anchor.textContent.replace(/\s+/g, ' ')}](${url})`
                )
            })
            const lns = pub.textContent
                .split('\n')
                .map((t) => t.replace(/^\s+/g, ''))
                .filter((t) => t)
            const author = lns.shift()
            const authors = author
                .replace(/[,|\s]+and\s+/g, ',')
                .split(',')
                .map((a) => {
                    if (typeof a == 'string')
                        return a.replace(/(^\s+)|([\.|\s]{0,}$)/g, '')
                })
                .filter((a) => a)
            const title = lns.shift()
            const publish = lns.join(' ')
            res.push({
                title,
                authors,
                publish,
            })
        }
    })
    console.log(yaml.dump(res, { indent: 4 }))
}

run()
