import VueSvg from './vue-svg.vue'

const install = function(Vue) {
  console.log('vue-svg installed')
  Vue.component('VueSvg', VueSvg);
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export { VueSvg }

export default {
  version: '0.1.6',
  install,
  VueSvg,
  vueSvg: VueSvg
}
