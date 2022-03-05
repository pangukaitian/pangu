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
        const nodes = pub.childNodes
        const order = ['authors', 'title', 'publish']
        let child_i = 0
        let authors: string[]
        let title: string = ''
        let url: undefined | string = undefined
        let publish: string = ''

        if (!pub.textContent.replace(/\s/g, '')) {
            return
        }
        while (order.length) {
            const node = nodes[child_i]
            if (typeof nodes[child_i] == 'undefined') {
                break
            }
            child_i++
            if (node.textContent.replace(/\s/g, '')) {
                const cur = order[0]
                if (cur == 'authors') {
                    authors = node.textContent
                        .replace(/[,|\s]+and\s+/g, ',')
                        .split(',')
                        .map((a) => {
                            if (typeof a == 'string')
                                return a.replace(/(^\s+)|([\.|\s]{0,}$)/g, '')
                        })
                        .filter((a) => a)
                    order.shift()
                    continue
                }
                if (cur == 'title') {
                    if (node.nodeType == 1) {
                        const a = node as Element
                        url = a.getAttribute('href')
                        title = a.textContent
                            .replace(/^\s+/gm, '')
                            .replace(/\n/g, ' ')
                            .replace(/\s+$/g, '')
                    } else {
                        title = nodes[2].textContent
                            .replace(/^\s+/gm, '')
                            .replace(/\n/g, ' ')
                            .replace(/\s+$/g, '')
                    }
                    order.shift()
                    continue
                }
                if (cur == 'publish') {
                    publish += node.textContent
                        .replace(/^\s+/gm, '')
                        .replace(/\n/g, ' ')
                        .replace(/\s+$/g, '')
                    if (typeof nodes[child_i] == 'undefined') {
                        order.shift()
                    }
                    continue
                }
            }
        }
        res.push({
            title,
            url,
            authors,
            publish,
        })
    })
    console.log(yaml.dump(res, { indent: 4 }))
}

run()
