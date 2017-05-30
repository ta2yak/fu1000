const remote = require("electron").remote
const settings = require('electron-settings');
const marked = require("marked")
const _ = require("lodash")



const vue = new Vue({
  el: '#card',
  data: {
    input: settings.get(window.location.hash + ".text") || '# hello',
    editable: false
  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.input, { sanitize: true })
    }
  },
  methods: {
    update: _.debounce(function (e) {
      settings.set(window.location.hash + ".text", e.target.value)
      this.input = e.target.value
    }, 300),
    onEdit: function(){
      this.editable = true;
    },
    onSave: function(){
      this.editable = false;
    },
    onClose: function(){
      remote.getCurrentWindow().close()
    }
  }
})

