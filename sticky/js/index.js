let marked = require("marked")
let _ = require("lodash")

new Vue({
  el: '#card',
  data: {
    input: '# hello',
    preview: false,
  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.input, { sanitize: true })
    }
  },
  methods: {
    update: _.debounce(function (e) {
      this.input = e.target.value
    }, 300),
    onPreview: function(){
      this.preview = !this.preview;
    },
    onSave: function(){

    },
    onCancel: function(){

    }
  }
})