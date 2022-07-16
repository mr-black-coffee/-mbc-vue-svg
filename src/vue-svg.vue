<template>
    <div class="vue-svg" :style="getStyle" ref="svgContainer" v-html="svgContent" v-on="innerOn"></div>
</template>

<script>
import { createSvg } from 'better-svg'
export default {
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
        }
    },
    data() {
        return {
            svgContent: '',
            svgDom: null
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
                this.updateValue()
            }
        }
    },
    mounted() {
        this.init()
    },
    methods: {
        async init() {
            if (!this.content && !this.src) {
                return
            }
            let url = this.src
            let svgContent = this.content || await this.fileLoader(url)
            if (svgContent) {
                if (!this.beforeRender) {
                    this.svgContent = svgContent.replace(/\n/g, '').replace(/^(.*)(<svg.*)/i, '$2')
                    return
                }
                this.svgDom = createSvg(svgContent)
            }
        },
        updateValue() {
            if (this.svgDom) {
                this.value.forEach(item => {
                    const {selector, value} = item
                    const doms = this.svgDom.querySelecotrAll(selector)
                    const len = doms.length
                    if (len === 0) {
                        return
                    } else if (len === 1) {
                        doms[0].innerHTML = Array.isArray(value)
                            ? value[0] ?? ''
                            : value ?? ''
                    } else {
                        // 多个值，如果value是数组则按顺序匹配，如果value不是数组则只修改第0个dom，后续dom都置空
                        for (let i = 0; i < len; i++) {
                            doms[i].innerHTML = Array.isArray(value)
                                ? value[i] ?? ''
                                : i === 0
                                    ? value ?? ''
                                    : ''
                        }
                    }
                })
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