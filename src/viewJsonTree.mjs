/**
 * Create html element
 * @private
 * @param {String} type html element
 * @param {Object} config
 */
function createElement(type, config) {
    const htmlElement = document.createElement(type)

    if (config === undefined) {
        return htmlElement
    }

    if (config.className) {
        htmlElement.className = config.className
    }

    if (config.content) {
        htmlElement.textContent = config.content
    }

    if (config.children) {
        config.children.forEach((el) => {
            if (el !== null) {
                htmlElement.appendChild(el)
            }
        })
    }

    return htmlElement
}


/**
 * create expanded element
 * @private
 * @param {Object} node
 * @return {HTMLElement}
 */
function createExpandedElement(node) {
    const iElem = createElement('i')

    if (node.expanded) {
        iElem.className = 'fas fa-caret-down'
    }
    else {
        iElem.className = 'fas fa-caret-right'
    }

    const caretElem = createElement('div', {
        className: 'wjv-caret-icon',
        children: [iElem],
    })

    const handleClick = node.toggle.bind(node)
    caretElem.addEventListener('click', handleClick)

    const indexElem = createElement('div', {
        className: 'wjv-json-index',
        content: node.key,
    })

    const typeElem = createElement('div', {
        className: 'wjv-json-type',
        content: node.type,
    })

    const keyElem = createElement('div', {
        className: 'wjv-json-key',
        content: node.key,
    })

    const sizeElem = createElement('div', {
        className: 'wjv-json-size'
    })

    if (node.type === 'array') {
        sizeElem.innerText = '[' + node.children.length + ']'
    }
    else if (node.type === 'object') {
        sizeElem.innerText = '{' + node.children.length + '}'
    }

    let lineChildren
    if (node.key === null) {
        lineChildren = [caretElem, typeElem, sizeElem]
    }
    else if (node.parent.type === 'array') {
        lineChildren = [caretElem, indexElem, sizeElem]
    }
    else {
        lineChildren = [caretElem, keyElem, sizeElem]
    }

    const lineElem = createElement('div', {
        className: 'wjv-line',
        children: lineChildren
    })

    if (node.depth > 0) {
        lineElem.style = 'margin-left: ' + node.depth * 24 + 'px;'
    }

    return lineElem
}


/**
 * create not expanded element
 * @private
 * @param {Object} node
 * @return {HTMLElement}
 */
function createNotExpandedElement(node) {
    const caretElem = createElement('div', {
        className: 'wjv-empty-icon',
    })

    const keyElem = createElement('div', {
        className: 'wjv-json-key',
        content: node.key
    })

    const separatorElement = createElement('div', {
        className: 'wjv-json-separator',
        content: ':'
    })

    const valueType = ' wjv-json-' + typeof node.value
    const valueContent = String(node.value)
    const valueElement = createElement('div', {
        className: 'wjv-json-value' + valueType,
        content: valueContent
    })

    const lineElem = createElement('div', {
        className: 'wjv-line',
        children: [caretElem, keyElem, separatorElement, valueElement]
    })

    if (node.depth > 0) {
        lineElem.style = 'margin-left: ' + node.depth * 24 + 'px;'
    }

    return lineElem
}


/**
 * create tree node
 * @private
 * @return {Object}
 */
function createNode() {
    return {
        key: null,
        parent: null,
        value: null,
        expanded: true,
        type: null,
        children: null,
        elem: null,
        depth: 0,

        setCaretIconRight() {
            const icon = this.elem.querySelector('.fas')
            icon.classList.replace('fa-caret-down', 'fa-caret-right')
        },

        setCaretIconDown() {
            const icon = this.elem.querySelector('.fas')
            icon.classList.replace('fa-caret-right', 'fa-caret-down')
        },

        hideChildren() {
            if (this.children !== null) {
                this.children.forEach((item) => {
                    item.elem.classList.add('hide')
                    if (item.expanded) {
                        item.hideChildren()
                    }
                })
            }
        },

        showChildren() {
            if (this.children !== null) {
                this.children.forEach((item) => {
                    item.elem.classList.remove('hide')
                    if (item.expanded) {
                        item.showChildren()
                    }
                })
            }
        },

        toggle: function() {
            if (this.expanded) {
                this.expanded = false
                this.hideChildren()
                this.setCaretIconRight()
            }
            else {
                this.expanded = true
                this.showChildren()
                this.setCaretIconDown()
            }
        }
    }
}


/**
 * Return variable type
 * @private
 * @param {*} val
 */
function getType(val) {
    let type = typeof val
    if (Array.isArray(val)) {
        type = 'array'
    }
    else if (val === null) {
        type = 'null'
    }
    return type
}


/**
 * Recursively traverse json object
 * @private
 * @param {Object} obj parsed json object
 * @param {Object} parent of object tree
 */
function traverseObject(obj, parent) {
    for (let key in obj) {
        const child = createNode()
        child.parent = parent
        child.key = key
        child.type = getType(obj[key])
        child.depth = parent.depth + 1
        child.expanded = true

        if (typeof obj[key] === 'object') {
            child.children = []
            parent.children.push(child)
            traverseObject(obj[key], child)
            child.elem = createExpandedElement(child)
        }
        else {
            child.value = obj[key]
            child.elem = createNotExpandedElement(child)
            parent.children.push(child)
        }
    }
}


/**
 * Create root of a tree
 * @private
 * @param {Object} obj Json object
 * @return {Object}
 */
function createTree(obj) {
    const tree = createNode()
    tree.type = getType(obj)
    tree.children = []
    tree.expanded = true

    traverseObject(obj, tree)
    tree.elem = createExpandedElement(tree)

    return tree
}


/**
 * Recursively traverse Tree object
 * @private
 * @param {Object} node
 * @param {Callback} callback
 */
function traverseTree(node, callback) {
    callback(node)
    if (node.children !== null) {
        node.children.forEach((item) => {
            traverseTree(item, callback)
        })
    }
}


/**
 * Render Tree object
 * @private
 * @param {Object} tree
 * @param {String} rootElem
 */
function render(tree, rootElem) {
    traverseTree(tree, (node) => {
        if (!node.expanded) {
            node.hideChildren()
        }
        rootElem.appendChild(node.elem)
    })
}


/**
 * 針對元素rootElem產生展示Json樹狀套件
 * 因沒有加入預先展開數據功能, 自己下載來修改
 *
 * Depend on: {@link https://github.com/pgrabovets/json-view json-view}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/viewJsonTree.test.js Github}
 * @memberOf wsemi
 * @param {Object} jsonObj 輸入Json物件
 * @param {Element} rootElem 輸入初始化元素
 * @example
 * need test in browser
 */
function viewJsonTree(jsonObj, rootElem) {
    rootElem.innerHTML = ''
    let tree = createTree(jsonObj)
    render(tree, rootElem)
}


export default viewJsonTree
