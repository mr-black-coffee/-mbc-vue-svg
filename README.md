# @vuecomp/vue-svg

一款适合vue2.x的浏览器端svg操作组件，包括生成单svg元素、带svg背景的div和弹性svg背景的div

## 安装

```bash
# npm
npm install @vuecomp/vue-svg
```

```bash
# yarn
yarn add @vuecomp/vue-svg
```

## 使用

### 组件内注册

```vue
import { vue-svg }  from '@vuecomp/vue-svg' 
components: {
  VueCropper
}
```

### 全局注册

```bash
// main.js
import VueSvg from '@vuecomp/vue-svg'
Vue.use(VueSvg)
```

### 使用

```vue
// $withBase为获取资源绝对路径的方法, loadSvg为读取文件的方法，可为异步方法
<VueSvg :src="$withBase('/img/bg.svg')" :fileLoader="loadSvg"></VueSvg>
```

### 属性

| Property           | Description                                                                                                                                                                                                                                                                      | Type           | Params          | Default       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------- | ------------- |
| src                | svg文件地址，请传入已解析过的绝对地址                                                                                                                                                                                                                                            | string         | -               | ''            |
| beforeRender       | 钩子函数，生成dom对象但还未渲染到页面时执行,会将svgDom和vue实例作为参数传入                                                                                                                                                                                                      | function       | svgDom,<br />vm | null          |
| afterRender        | 渲染元素渲染完成但尚未显示(透明状态)时执行，会将svgDom和vue实例作为参数传入                                                                                                                                                                                                      | function       | svgDom,<br />vm | null          |
| width              | 宽度,px数值或百分比值字符串                                                                                                                                                                                                                                                      | number/string  | -               | '100%'        |
| height             | 高度,px数值或百分比值字符串                                                                                                                                                                                                                                                      | number/string  | -               | '100%'        |
| content            | 直接传入svg的html内容用于动态生成svg元素                                                                                                                                                                                                                                         | string         | -               | ''            |
| fileLoader         | 导入svg文件的异步方法                                                                                                                                                                                                                                                            | async function | -               | async () =>'' |
| value              | 需要修改元素内容的配置列表，每一项为选择器和内容值，使用innerHTML方式修改<br />{<br />   selector: '.textM',  // 选中css类为textM的元素<br />   value: '100'  // 修改其内容为100<br />}                                                                                          | array          | -               | []            |
| percentAnimations  | 百分比动画配置列表，每一项为选择器和动画停止的百分比，百分比如果大于1则会除以100后再进行计算即传入0.95和传入95是同样的效果，最终修改的对象为animate元素的to属性值<br />{<br />   selector: '.completed',  // 选中css类为completedtext的元素<br />   value: 0.95 // 百分比<br />} | array          | -               | []            |
| percentChildren    | 以百分比值设置子元素可见性表现动画的配置列表，每一项为选择器和百分比值，按百分比值确定显示的子元素数量(opacity=1)<br />{<br />   selector: '.completed',  // 选中css类为completedtext的元素<br />   value: 0.95 // 百分比<br />}                                                 | array          | -               | []            |
| classNames         | 要修改css类的元素配置列表，<br />{<br />  selector: '.item-value',  // 选择器<br />   value: '--iscomplete --green' // 要附加的样式类<br />}                                                                                                                                     | array          | -               | []            |
| attrList           | 要修改的元素属性配置列表<br />{<br />   selector: '.item-value',  // 选择器<br />   prop: 'fill', // 属性名<br />   value: '#ff0', // 属性值<br />   type: '', // 如果要删除属性，传入'delete'，否则为修改<br />}                                                                | array          | -               | []            |
| centerText         | 是否需要居中文本                                                                                                                                                                                                                                                                 | boolean        | -               | true          |
| centerTextSelector | 居中文本的样式类选择器                                                                                                                                                                                                                                                           | string         | -               | '.text-m'     |
| countTo            | 翻牌数字配置，当只有1个元素需要翻牌时可只传入该元素的配置对象，否则传入配置对象列表                                                                                                                                                                                              | Object/Array   | -               | null          |
| duration           | 统一设置动画时长毫秒，在各配置项中设置的duration将覆盖本设置                                                                                                                                                                                                                     | number         |                 | 3000          |
| autoPlay           | 渲染完成后开始动画（翻牌、百分比动画）                                                                                                                                                                                                                                           | boolean        | -               | false         |
| id                 | 标记，可用于调试时显示                                                                                                                                                                                                                                                           | string         | -               | ''            |
| debug              | 是否开启debug模式，开启将打印console信息                                                                                                                                                                                                                                         | boolean        | -               | false         |
