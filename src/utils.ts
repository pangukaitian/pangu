const newEle = (
    tagName: string,
    classes: string[] = [],
    attr: Record<string, string> = {},
    inner?: string
): HTMLElement => {
    const ele = document.createElement(tagName)
    classes.forEach((cls) => {
        ele.classList.add(cls)
    })
    for (const [k, v] of Object.entries(attr)) {
        ele.setAttribute(k, v)
    }
    if (typeof inner != 'undefined') {
        ele.innerHTML = inner
    }
    return ele
}

const toggleFocus = (
    className: string,
    focusClassName,
    focusTarget: Element
) => {
    Array.from(
        document.querySelectorAll(`.${className}.${focusClassName}`)
    ).forEach((prev) => {
        prev.classList.remove(focusClassName)
    })
    focusTarget.classList.add(focusClassName)
}

const toggleHelper = (
    className: string,
    focusClassName: string,
    click_cb: (ele: Element, event: Event) => Promise<boolean> | boolean,
    autoToggleFocus: boolean = true
) => {
    Array.from(document.getElementsByClassName(className)).forEach((target) => {
        target.addEventListener('click', async (event) => {
            if (target.classList.contains(focusClassName)) return
            if ((await click_cb(target, event)) && autoToggleFocus) {
                toggleFocus(className, focusClassName, target)
            }
        })
    })
}

const getLangAlt = <T, K extends string>(
    txtObj: Partial<Record<K, T>> | undefined,
    priority: K[]
): T | undefined => {
    if (typeof txtObj == 'undefined') return undefined
    const pri = priority.filter((val, idx, arr) => {
        return arr.indexOf(val) == idx
    })
    let res: T | undefined
    while (pri.length) {
        res = txtObj[pri.shift()]
        if (typeof res != 'undefined') break
    }
    return res
}

export { newEle, toggleFocus, toggleHelper, getLangAlt }
