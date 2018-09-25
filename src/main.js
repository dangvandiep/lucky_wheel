// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueI18n from 'vue-i18n'
import viMessage from './locales/vi.json'
import enMessage from './locales/en.json'

Vue.config.productionTip = false

Vue.use(VueI18n)

// Config multi languages
const messages = {
  vi: viMessage,
  en: enMessage
}

const i18n = new VueI18n({
  locale: LANG, // set locale
  messages,
  fallbackLocale: 'en'
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  template: '<App/>',
  components: { App }
})
