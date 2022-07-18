# @vuecomp/vue-svg

一款适合vue2.x的svg操作组件，包括生成单svg元素、带svg背景的div和弹性svg背景的div

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

### 页面使用

```vue
// $withBase为获取资源绝对路径的方法, loadSvg为读取文件的方法，可为异步方法
<VueSvg :src="$withBase('/img/bg.svg')" :fileLoader="loadSvg"></VueSvg>
```
