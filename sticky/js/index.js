const remote = require("electron").remote
const settings = require('electron-settings');
const marked = require("marked")
const _ = require("lodash")



const vue = new Vue({
  el: '#card',
  data: {
    title: settings.get(window.location.hash + ".title") || '',
    input: settings.get(window.location.hash + ".text") || '# hello',
    editable: false
  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.input, { sanitize: true })
    }
  },
  methods: {
    updateTitle: _.debounce(function (e) {
      settings.set(window.location.hash + ".title", e.target.value)
      this.title = e.target.value
    }, 300),
    updateText: _.debounce(function (e) {
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
      if (confirm("このカードを削除してもよろしいですか？")) {
        // 永続化データから削除する
        let windows = settings.get('windows')
        let key = window.location.hash
        _.remove(windows, function(w) { return ("#" + w.id) === key })
        settings.set('windows', windows)
        settings.delete(window.location.hash)
        remote.getCurrentWindow().close()
      }
    }
  }
})

