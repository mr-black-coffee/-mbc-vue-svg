<template>
    <div class="vue-svg" :style="getStyle" ref="svgContainer" v-on="innerOn"></div>
</template>

<script>
import {
    createSvg,
    SvgTextMonitor,
    CountTo,
    OP_TYPES,
    getStyleRuleFinder,
    getKeyframesRuleFinder,
    getStyleSheet,
    getRule,
    addRule,
    deleteRule,
    getAnimationName,
    getAttrValueForAnimation,
    getFinderName
} from 'better-svg/src'
import M from 'minimatch'

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
        /**
         * svg文件地址，请传入已解析过的绝对地址，如dev或production环境中的地址
         */
        src: {
            type: String,
            default: ''
        },
        /**
         * 钩子函数，生成dom对象但还未渲染到页面时执行,会将svgDom和vue实例作为参数传入
         */
        beforeRender: {
            type: Function,
            default: null
        },
        /**
         * 钩子函数，渲染元素渲染完成但尚未显示(透明状态)时执行，会将svgDom和vue实例作为参数传入
         */
        afterRender: {
            type: Function,
            default: null
        },
        /**
         * 读取文件完毕后执行的钩子，将文件内容作为参数传递，应返回修改后的文件内容字符串
         */
        afterLoad: {
            type: Function,
            default: null
        },
        /**
         * 宽度,px数值或百分比值字符串
         */
        width: {
            type: [Number, String],
            default: '100%'
        },
        /**
         * 高度,px数值或百分比值字符串
         */
        height: {
            type: [Number, String],
            default: '100%'
        },
        /**
         * 已解析的svg文件的内容，如硬拷贝svg文件的内容
         */
        content: {
            type: String,
            default: ''
        },
        /**
         * 读取svg文件的方法，返回string类型的文件内容
         */
        fileLoader: {
            type: Function,
            default: async () => ''
        },
        /**
         * 数组，每一项为selector选择器和要修改的value值，仅修改innerHTML值
         */
        value: {
            type: Array,
            default: () => [
                // {
                //     selecotr: '.Text',
                //     value: 'text'
                // }
            ]
        },
        /**
         * 元素百分比动画集合
         */
        percentAnimations: {
            type: Array,
            default: () => []
        },
        /**
         * 按子元素个数实现百分比动画的集合
         */
        percentChildren: {
            type: Array,
            default: () => []
        },
        /**
         * 类名
         */
        classNames: {
            type: Array,
            default: () => []
        },
        /**
         * 增加到dom的类
         */
        addClassNames: {
            type: Array,
            default: () => []
        },
        /**
         * 从dom中删除的类
         */
        removeClassNames: {
            type: Array,
            default: () => []
        },
        /**
         * 要修改的属性列表
         * @values   
         */
        attrList: {
            type: Array,
            default: () => []
        },
        /**
         * 通过修改css属性完成动画
         */
        cssAnimations: {
            type: Array,
            default: () => [
                // 内容的修改不应在此处修改，可能会需要翻牌效果等，这里修改的属性不会立即修改，而是存到列表中，在start中统一执行，以保证动画与其他更新同步执行
                // 传入元素定位方式（类selector等）
                // {
                //     selector: '.target-el-class',
                //     attrs: {
                //         height: 30, //需要修改的属性：width/height/x/y/rx/ry...
                //         width: 100,
                //         rx: 10
                //     },
                //     animation: {
                //         name: 'customAnimationName', // 如果为空，将会自动新建一个，标记keyframe, 如temp001: @keyframes temp001 ...
                //         content: `
                //         @keyframes customAnimationName {
                //             0% {
                //                 height: 0px;
                //                 width: 0px;
                //                 rx: 0;
                //             }
                //             50% {
                //                 height: 20px;
                //                 width: 60px;
                //                 rx: 6;
                //             }
                //             100% {
                //                 height: 30px;
                //                 width: 100px;
                //                 rx: 10;
                //             }
                //         }
                //         `, // 如果为空，将自动新建0%到100%的动画，不为空则自定义动画过程及值，应与attrs中的值对应,name和content外的参数无效
                //         translatedAttrs: {
                //              width: 'px',
                //              height: 'px',
                //          }, // 如果content为空，自动新建动画时translatedAttrs包含在内的属性会自动添加单位，默认width/height属性自动单位为px
                //         duration: '1s', // 如果content为空，默认1s
                //         easing: 'linear', // 缓动，默认线性linear,
                //         
                //     },
                //     // 获取selector元素的cssRule并修改animation信息时需要的定位规则
                //     ruleConfig: {
                //         selector: '', // String|RegExp|Function 
                //                       // 1. 如果是function，会将cssRules中的每一项传递给function，如果返回值是truthy值，则返回当前cssRule项，忽略key和isEqual参数
                //                       // 2. 如果是RegExp则返回key字段值的test结果，最后一个参数isEqual无效
                //                       // 3. 如果是字符串，且isEqual为false,非严格相等，则判断是否包含，如果是严格相等则使用 === 检测
                //         key: '', //在cssRules对象中进行比较的key如selectorText
                //         isEqual: true,  // 比对时是否严格相等, 默认为true
                //     }
                // }
            ]
        },
        /**
         * 是否需要监控居中文本
         */
        centerText:{
            type: Boolean,
            default: true
        },
        /**
         * svg中需要设置为居中的选择器
         */
        centerTextSelector: {
            type: String,
            default: '.text-m'
        },
        /**
         * 翻牌效果
         */
        countTo: {
            type: [Array, Object],
            default: null
        },
        /**
         * 动画时长
         */
        duration: {
            type: Number,
            default: 3000
        },
        /**
         * 是否自动播放
         */
        autoPlay: {
            type: Boolean,
            default: false
        },
        /**
         * id标记，可用于log显示
         */
        id: {
            type: String,
            default: ''
        },
        /**
         * 是否是debug模式，是则打印信息
         */
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
        percentAnimations: {
            deep: true,
            handler() {
                this.inited && this.updatePercentAnimations()
            }
        },
        percentChildren: {
            deep: true,
            handler() {
                this.inited && this.updatePercentChildren()
            }
        },
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
        attrList: {
            deep: true,
            handler() {
                this.inited && this.updateAttrs()
            }
        },
        cssAnimations: {
            deep: true,
            handler() {
                this.inited && this.initCssAnimations()
            }
        },
        addClassNames: {
            deep: true,
            handler() {
                this.inited && this.addDomClassNames()
            }
        },
        removeClassNames: {
            deep: true,
            handler() {
                this.inited && this.removeDomClassNames()
            }
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        /**
         *  初始化
         */
        async init() {
            this.log('debug:', this.debug)
            let _this = this
            if (!this.content && !this.src) {
                return
            }
            let url = this.src
            let svgContent = this.content || await this.fileLoader(url)
            if (svgContent) {
                if (this.afterLoad && typeof this.afterLoad === 'function') {
                    svgContent = this.afterLoad(svgContent)
                }
                svgContent = svgContent.replace(/\n/g, '').replace(/^(.*)(<svg.*)/i, '$2')
                _this.svgDom = createSvg(svgContent)
                _this.beforeRender && _this.beforeRender(_this.svgDom, _this)
                _this.centerText && _this.hideDom(_this.svgDom, _this.centerTextSelector)
                // 可能已销毁dom
                if (!_this.$refs.svgContainer) {
                    return
                }
                _this.$refs.svgContainer.appendChild(_this.svgDom)
                let img = document.createElement('img')
                img.src = ''
                img.onerror = function() {
                    setTimeout(() => {
                        _this.initTextMonitor()
                        _this.updateValue()
                        _this.initCountTo()
                        _this.updateClassNames(_this.classNames)
                        _this.updateAttrs()
                        _this.initCssAnimations()
                        this?.parentNode?.removeChild(this)
                        if (_this.afterRender) {
                            _this.afterRender(svgDom, _this)
                        }
                        _this.resumeDom(_this.svgDom, _this.centerTextSelector)
                        if (_this.autoPlay) {
                            _this.start()
                        }
                        _this.inited = true
                        _this.$emit('inited')
                    }, 500)
                }
                if (!_this.$refs.svgContainer) {
                    return
                }
                _this.$refs.svgContainer.appendChild(img)
            }
        },
        
        /**
         *  隐藏dom
         * @param {SVGElement} svgDom svg元素Dom
         * @param {string} selector css选择器
         */
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

        /**
         *  恢复dom可见
         * @param {SVGElement} svgDom svg元素Dom
         * @param {string} selector css选择器
         */
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

        /**
         *  初始化需要居中的文本元素
         */
        initTextMonitor() {
            if (this.centerText) {
                this.textMonitor = new SvgTextMonitor({
                    container: this.svgDom,
                    selector: this.centerTextSelector
                })
            }
            this.inited = true
        },
        
        /**
         *  更新元素值
         */
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

        /**
         *  更新样式类
         * @param {array} newList 新样式列表
         * @param {array} oldList 旧样式列表
         */
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

        addDomClassNames() {
            this.addClassNames.forEach(item => {
                let { selector, className } = item
                if (selector && className) {
                    let dom = document.querySelector(selector)
                    dom && dom.classList.add(className)
                }
            })
        },

        removeDomClassNames() {
            this.removeClassNames.forEach(item => {
                let { selector, className } = item
                if (selector && className) {
                    let dom = document.querySelector(selector)
                    dom && dom.classList.remove(className)
                }
            })
        },


        /**
         *  按照百分比步进更新animate元素动画(from, to)，如果to是 `percent  total`方式，则修改percent值 
         * 如果是`end`方式，则修改的是end值
         */
        updatePercentAnimations() {
            if (this.svgDom) {
                this.percentAnimations.forEach(item => {
                    const {selector, value, duration} = item
                    const per = value > 1
                        ? value / 100
                        : value
                    const dom = this.svgDom.querySelector(selector)
                    if (dom) {
                        const to = dom.getAttribute('to')
                        const toArr = to.split(/\s+/)
                        if (toArr) {
                            if (toArr.length === 0) {
                                dom.setAttribute('to', `${val}`)
                            } else {
                                const val = Math.round(per * toArr[1])
                                dom.setAttribute('to', `${val} ${toArr[1]}`)
                            }
                        }
                    }
                })
            }
        },

        /**
         *  按照百分比步进更新指定元素的指定元素opacity属性
         */
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

        /**
         *  修改元素属性值
         */
        updateAttrs() {
            if (this.svgDom) {
                this.attrList.forEach(item => {
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

        /**
         * 实现css属性动画
         */
        initCssAnimations() {
            // 传入元素定位方式（类selector等）
                // {
                //     selector: '.target-el-class',
                //     attrs: {
                //         height: 30, //需要修改的属性：width/height/x/y/rx/ry...
                //         width: 100,
                //         rx: 10
                //     },
                //     animation: {
                //         name: 'customAnimationName', // 如果为空，将会自动新建一个，标记keyframe, 如temp001: @keyframes temp001 ...
                //         content: `
                //         @keyframes customAnimationName {
                //             0% {
                //                 height: 0px;
                //                 width: 0px;
                //                 rx: 0;
                //             }
                //             50% {
                //                 height: 20px;
                //                 width: 60px;
                //                 rx: 6;
                //             }
                //             100% {
                //                 height: 30px;
                //                 width: 100px;
                //                 rx: 10;
                //             }
                //         }
                //         `, // 如果为空，将自动新建0%到100%的动画，不为空则自定义动画过程及值，应与attrs中的值对应,name和content外的参数无效
                //         translatedAttrs: {
                //              width: 'px',
                //              height: 'px',
                //          }, // 如果content为空，自动新建动画时translatedAttrs包含在内的属性会自动添加单位，默认width/height属性自动单位为px
                //         duration: '1s', // 如果content为空，默认1s
                //         easing: 'linear', // 缓动，默认线性linear,
                //         
                //     },
                //     // 获取selector元素的cssRule并修改animation信息时需要的定位规则
                //     ruleConfig: {
                //         selector: '', // String|RegExp|Function 
                //                       // 1. 如果是function，会将cssRules中的每一项传递给function，如果返回值是truthy值，则返回当前cssRule项，忽略key和isEqual参数
                //                       // 2. 如果是RegExp则返回key字段值的test结果，最后一个参数isEqual无效
                //                       // 3. 如果是字符串，且isEqual为false,非严格相等，则判断是否包含，如果是严格相等则使用 === 检测
                //         key: '', //在cssRules对象中进行比较的key如selectorText
                //         isEqual: false,  // 比对时是否严格相等, 默认为true
                //     }
                // }
            // 
            this.cssAnimationList = []
            this.cssAnimations.forEach(item => {
                let {
                    id,
                    selector, 
                    attrs,
                    animation,
                } = item
                if (!selector) {
                    return
                }
                id = `${id || 'ani'}_${(Math.random() + '').slice(2)}`
                let animationItem = {
                    id,
                    funcs: {
                        // 调试用
                        attrFuncList: [],
                        animationFuncList: []
                    }
                }
                this.cssAnimationList.push(animationItem)
                if (attrs) {
                    animationItem.funcs.attrFuncList.push(() => {
                        let dom = this.svgDom.querySelector(selector)
                        if (dom) {
                            Object.keys(attrs).forEach(key => {
                                this.log(`修改属性${key}为${attrs[key]}`)
                                dom.setAttribute(key, attrs[key])
                            })
                        }
                    })
                }
                // css animation
                
                if (animation) {
                    let { name, content, duration = '1s', easing = 'linear', ruleConfig = {
                        selector: name,
                        key: 'selectorText', // 按类名比较,
                        isEqual: false
                    },
                    translatedAttrs } = animation
                    // 构建 keyframes rule
                    if (content) {
                        !name && (name = getAnimationName(content));
                    } else if (attrs) {
                        !name && (name = `ani_${(Math.random() + '').slice(2)}`);
                        const aniKeys = Object.keys(attrs)
                        // 根据attrs的修改内容构建content
                        content = `@keyframes ${name} {
                            0% {
                                ${aniKeys.map(aniKey => `${aniKey}: {${aniKey}}`)}
                            }
                            100% {
                                ${aniKeys.map(aniKey => `${aniKey}: ${getAttrValueForAnimation(aniKey, attrs[aniKey], translatedAttrs)}`)}
                            }
                        }`
                    }
                    if (name && content) {
                        // 缓存类型finder
                        let styleRule
                        const finderName = `${getFinderName(ruleConfig?.key || 'selectorText', ruleConfig?.isEqual || true, 1)}_finder`
                        if (!this[finderName]) {
                            this[finderName] = getStyleRuleFinder(ruleConfig?.key || 'selectorText', ruleConfig?.isEqual || true)
                        }
                        let styleSheet
                        let rule
                        if (!this.styleSheet) {
                            const findResult = getStyleSheet(this[finderName], selector) || {}
                            styleSheet = findResult.styleSheet
                            rule = findResult.rule
                            styleSheet && (this.styleSheet = styleSheet);
                            if (rule) {
                                styleRule = rule
                            } else {
                                // 新建rule
                                // todo
                            }
                        } else {
                            rule = getRule(this[finderName], selector, this.styleSheet)
                        }
                        if (this.styleSheet && rule){
                            // 增加新的规则
                            animationItem.funcs.animationFuncList.push(() => {
                                this.log(`增加rule: \n ${content}`)
                                // 修改content中的实时值如{height} {y}
                                const dom = document.querySelector(selector)
                                if (dom) {
                                    Object.keys(attrs).forEach(attr => {
                                        let val = getAttrValueForAnimation(attr, +dom.getAttribute(`last-${attr}`), translatedAttrs)
                                        content = content.replace(`{${attr}}`, val)
                                    })
                                }
                                
                                addRule(this.styleSheet,  content)
                                // 修改selector类使用的animation
                                this.log(`修改${selector}类的animation属性:`)
                                this.log(`animationName: ${name}`)
                                rule.style.animationName = name
                                this.log(`animationDuration: ${duration}`)
                                rule.style.animationDuration = duration
                                this.log(`animationTimingFunction: ${easing}`)
                                rule.style.animationTimingFunction = easing
                            })
                            // 将当前rule记录到待删除列表
                            !this.outdatedAnimationList && (this.outdatedAnimationList = []);
                            this.outdatedAnimationList.push({
                                styleSheet: this.styleSheet,
                                key: name
                            })
                        }
                    }
                }
            })
            this.log('生成动画配置: ', this.cssAnimationList)
        },

        /**
         * 开始动画
         */
        startAnimation() {
            // 清除旧rule
            this.clearOutdatedRules()
            if (this.cssAnimationList?.length) {
                this.cssAnimationList.forEach(animation => {
                    this.log('开始执行动画: ', animation.id)
                    animation.funcs.attrFuncList.forEach(attrFunc => {
                        attrFunc()
                    })
                    animation.funcs.animationFuncList.forEach(animationFunc => {
                        animationFunc()
                    })
                })
            }
        },

        /**
         * 删除过期rule，避免连续动画使styleSheet垃圾过多
         */
        clearOutdatedRules() {
            if (this.outdatedAnimationList) {
                this.outdatedAnimationList.forEach(({ styleSheet, key }) => {
                    deleteRule(styleSheet, key)
                })
            }
        },

        /**
         *  初始化翻牌效果
        */
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

        /**
         *  开始翻牌效果
         */
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

        /**
         *  开始执行所有动画效果
         */
        start() {
            this.log('exec start()...')
            this.startCountTo()
            this.updatePercentAnimations()
            this.updatePercentChildren()
            this.startAnimation()
        },

        /**
         *  debug模式下打印log
         */
        log(title = '', msg = '') {
            if (this.debug) {
                console.log(`${this.id || '-'} : `, title, msg)
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