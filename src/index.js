import VueSvg from './vue-svg.vue'

export default VueSvg

const install = function(Vue) {
  console.log('vue-svg installed')
  Vue.component('VueSvg', VueSvg);
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

