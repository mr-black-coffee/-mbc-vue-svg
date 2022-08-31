<template>
    <div class="vue-svg" :style="getStyle" ref="svgContainer" v-on="innerOn"></div>
</template>

<script>
import { createSvg, SvgTextMonitor, CountTo } from 'better-svg'

async function updateDomOpacity(dom, duration = 50, val = 1) {
    return new Promise(resolve => {
        dom.style.opacity = val
        setTimeout(() => {
            resolve()
        }, duration)
    })
}

export default {
    name: 'VueSvg',
    props: {
        // svg文件地址，请传入已解析过的绝对地址，如dev或production环境中的地址
        src: {
            type: String,
            default: ''
        },
        // 钩子函数，生成dom对象但还未渲染到页面时执行
        beforeRender: {
            type: Function,
            default: null
        },
        // 宽度,px数值或百分比值字符串
        width: {
            type: Number|String,
            default: 0
        },
        // 高度,px数值或百分比值字符串
        height: {
            type: Number|String,
            default: 0
        },
        // 已解析的svg文件的内容，如硬拷贝svg文件的内容
        content: {
            type: String,
            default: ''
        },
        // 数组，每一项为selector选择器和要修改的value值，仅修改innerHTML值
        value: {
            type: Array,
            default: () => [
                // {
                //     selecotr: '.Text',
                //     value: 'text'
                // }
            ]
        },
        // 读取svg文件的方法，返回string类型的文件内容
        fileLoader: {
            type: Function,
            default: async () => ''
        },
        // 百分比动画集合
        percentAnimations: {
            type: Array,
            default: () => []
        },
        // 按子元素个数实现百分比动画的集合
        percentChildren: {
            type: Array,
            default: () => []
        },
        // 类名
        classNames: {
            type: Array,
            default: () => []
        },
        // 属性
        // selector: 选择器, prop: 属性名, value: 属性值, type: 'delete'-删除，否则修改
        attrs: {
            type: Array,
            default: () => []
        },
        // 是否需要监控居中文本
        centerText:{
            type: Boolean,
            default: true
        },
        // svg中需要设置为居中的选择器
        centerTextSelector: {
            type: String,
            default: '.text-m'
        },
        countTo: {
            type: Array | Object,
            default: null
        },
        duration: {
            type: Number,
            default: 3000
        },
        autoPlay: {
            type: Boolean,
            default: false
        },
        id: {
            type: String,
            default: ''
        },
        debug: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            svgContent: '',
            svgDom: null,
            inited: false,
            textMonitor: null
        }
    },
    computed: {
        getStyle() {
            let style = {
                width: this.width
                    ? typeof this.width === 'number'
                        ? `${this.width}px`
                        : this.width
                    : '100%',
                height: this.height
                    ? typeof this.height === 'number'
                        ? `${this.height}px`
                        : this.height
                    : '100%'
            }
            return style
        },
        innerOn() {
            return this.$listeners
        },
    },
    watch: {
        value: {
            deep: true,
            handler() {
                this.inited && this.updateValue()
            }
        },
        // percentAnimations: {
        //     deep: true,
        //     handler() {
        //         this.inited && this.updatePercentAnimations()
        //     }
        // },
        // percentChildren: {
        //     deep: true,
        //     handler() {
        //         this.inited && this.updatePercentChildren()
        //     }
        // },
        countTo: {
            deep: true,
            handler() {
                this.inited && this.initCountTo()
            }
        },
        classNames: {
            deep: true,
            handler(newList, oldList) {
                this.inited && this.updateClassNames(newList, oldList)
            }
        },
        attrs: {
            deep: true,
            handler() {
                this.inited && this.updateAttrs()
            }
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        async init() {
            this.log('debug:', this.debug)
            let _this = this
            if (!this.content && !this.src) {
                return
            }
            let url = this.src
            let svgContent = this.content || await this.fileLoader(url)
            if (svgContent) {
                svgContent = svgContent.replace(/\n/g, '').replace(/^(.*)(<svg.*)/i, '$2')
                _this.svgDom = createSvg(svgContent)
                _this.beforeRender && _this.beforeRender(this.svgDom)
                _this.centerText && _this.hideDom(_this.svgDom, _this.centerTextSelector)
                // 可能已销毁dom
                if (!_this.$refs.svgContainer) {
                    return
                }
                _this.$refs.svgContainer.appendChild(_this.svgDom)
                let img = document.createElement('img')
                img.src = ''
                img.onerror = function() {
                    _this.initTextMonitor()
                    _this.updateValue()
                    _this.initCountTo()
                    _this.updateClassNames(_this.classNames)
                    this.parentNode.removeChild(this)
                    
                    setTimeout(() => {
                        _this.resumeDom(_this.svgDom, _this.centerTextSelector)
                        if (_this.autoPlay) {
                            _this.start()
                        }
                        _this.inited = true
                        _this.$emit('inited')
                    }, 100)
                }
                if (!_this.$refs.svgContainer) {
                    return
                }
                _this.$refs.svgContainer.appendChild(img)
            }
        },
        
        hideDom(svgDom, selector) {
            if (svgDom && selector) {
                let nodeList = [...svgDom.querySelectorAll(selector)]
                nodeList.forEach(node => {
                    let oriOpacity = node.getAttribute('opacity')
                    if (oriOpacity) {
                        node.setAttribute('oriOpacity', oriOpacity)
                    }
                    node.setAttribute('opacity', '0')
                })
            }
        },

        resumeDom(svgDom, selector) {
            if (svgDom && selector) {
                let nodeList = [...svgDom.querySelectorAll(selector)]
                nodeList.forEach(node => {
                    let oriOpacity = node.getAttribute('oriOpacity')
                    if (oriOpacity) {
                        node.setAttribute('opacity', oriOpacity)
                        node.removeAttribute('oriOpacity')
                        return
                    }
                    node.removeAttribute('opacity')
                })
            }
        },

        initTextMonitor() {
            if (this.centerText) {
                this.textMonitor = new SvgTextMonitor({
                    container: this.svgDom,
                    selector: this.centerTextSelector
                })
            }
            this.inited = true
        },

        updateValue() {
            if (this.svgDom) {
                this.value.forEach(item => {
                    const {selector, value} = item
                    const nodeList = this.svgDom.querySelectorAll(selector)
                    const len = nodeList.length
                    if (len === 0) {
                        return
                    } else if (len === 1) {
                        nodeList[0].innerHTML = Array.isArray(value)
                            ? value[0] ?? ''
                            : value ?? ''
                    } else {
                        // 多个值，如果value是数组则按顺序匹配，如果value不是数组则只修改第0个dom，后续dom都置空
                        for (let i = 0; i < len; i++) {
                            nodeList[i].innerHTML = Array.isArray(value)
                                ? value[i] ?? ''
                                : i === 0
                                    ? value ?? ''
                                    : ''
                        }
                    }
                })
            }
        },

        updateClassNames(newList = [], oldList = []) {
            if (this.svgDom) {
                this.classNames.forEach(classNameConfig => {
                    const {selector, value} = classNameConfig
                    const nodeList = this.svgDom.querySelectorAll(selector)
                    if (nodeList.length) {
                        // 增加
                        newList.forEach(item => {
                            nodeList.forEach(node => {
                                if (!node.classList.contains(value)) {
                                    node.classList.add(value)
                                }
                            })
                        })
                        // 删除
                        oldList.forEach(item => {
                            if (this.newList && !this.newList.includes(value)) {
                                nodeList.forEach(node => {
                                    if (node.classList.contains(value)) {
                                        node.classList.remove(value)
                                    }
                                })
                            }
                        })
                    }
                })
            }
        },

        updatePercentAnimations() {
            if (this.svgDom) {
                this.percentAnimations.forEach(item => {
                    const {selector, value} = item
                    const per = value > 1
                        ? value / 100
                        : value
                    const dom = this.svgDom.querySelector(selector)
                    if (dom) {
                        const to = dom.getAttribute('to')
                        const toArr = to.split(/\s+/)
                        if (toArr && toArr.length > 1) {
                            const val = Math.round(per * toArr[1])
                            dom.setAttribute('to', `${val} ${toArr[1]}`)
                        }
                    }
                })
            }
        },

        updatePercentChildren() {
            if (this.svgDom) {
                this.percentChildren.forEach(async (item) => {
                    const {selector, value, duration = this.duration} = item
                    const per = value > 1
                        ? value / 100
                        : value
                    const dom = this.svgDom.querySelector(selector)
                    if (dom) {
                        const max = dom.children.length
                        let steps = Math.floor(max * per)
                        if (steps === 0 && value > 0) {
                            steps = 1
                        }
                        if (steps > max) {
                            steps = max
                        }
                        for (let i = 0; i < steps; i++) {
                            await updateDomOpacity(dom.children[i], duration)
                        }
                    }
                })
            }
        },

        updateAttrs() {
            if (this.svgDom) {
                this.attrs.forEach(item => {
                    const {selector, prop, value, type} = item
                    const nodeList = this.svgDom.querySelectorAll(selector)
                    const len = nodeList.length
                    if (len === 0) {
                        return
                    } else {
                        for (let i = 0; i < len; i++) {
                            if (prop) {
                                if (type === 'delete') {
                                    // 删除
                                    nodeList[i].removeAttribute(prop)
                                } else {
                                    // 修改
                                    nodeList[i].setAttribute(prop, value)
                                }
                            }
                        }
                    }
                })
            }
        },

        initCountTo() {
            this.log('start initCountTo')
            if (this.countTo) {
                const countToList = Array.isArray(this.countTo)
                    ? this.countTo
                    : [this.countTo]
                this.countToList = []
                countToList.forEach(c => {
                    if (!c.duration) {
                        c.duration = this.duration
                    }
                    this.log('added new countTo', c)
                    this.countToList.push(new CountTo(c, this.svgDom))
                })
            }
        },

        startCountTo(index = -1) {
            this.log('start counting', this?.countToList)
            if (index > -1) {
                const c = this?.countToList?.[index]
                c && c.start()
            } else {
                this.log('countToList', this.countToList)
                this.countToList && this.countToList.forEach(c => c.start())
            }
        },

        start() {
            this.log('exec start()...')
            this.startCountTo()
            this.updatePercentAnimations()
            this.updatePercentChildren()
        },

        log(title, msg) {
            if (this.debug) {
                console.log(`${this.id || 'unknown'} -- `, title, msg)
            }
        }
    }
}
</script>
<style>
.vue-svg{
    position: relative;
}
.vue-svg svg{
    width: 100%;
    height: 100%;
}
</style>