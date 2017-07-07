<template>
    <div>
        <div id="menu" class="ui fluid top compact fixed menu borderless inverted teal draggable">
            <div class="item">
                <i class="hashtag icon"></i> {{ title }}
            </div>

            <div class="item right no-drag">
                <div class="right floated ui icon buttons compact">
                <button v-on:click="onEdit" class="ui button compact">
                    <i class="setting icon">&nbsp;</i>
                </button>
                <button v-on:click="onClose" class="ui button compact">
                    <i class="close icon">&nbsp;</i>
                </button>
                </div>
            </div>
        </div>

        <div id="content" class="ui container">
            <div class="description">
                <div class="ui form">
                <div class="field">
                    <div v-html="compiledMarkdown"></div>
                </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    const electron = require("electron")
    const remote = electron.remote
    const ipc = electron.ipcRenderer
    const windowManager = remote.require('electron-window-manager')
    const marked = require("marked")
    const _ = require("lodash")


    let renderer = new marked.Renderer()
    renderer.listitem = (text) => {
        if (/^\s*\[[x ]\]\s*/.test(text)) {
            text = text
            .replace(/^\s*\[ \]\s*/, '<i class="square outline icon"></i> ')
            .replace(/^\s*\[x\]\s*/, '<i class="checkmark box icon"></i> ')
            return '<li style="list-style: none">' + text + '</li>';
        } else {
            return '<li>' + text + '</li>';
        }
    }

    renderer.link = function (href, title, text) {
        return "<a onclick='openExternalLink(\"" + href + "\"); return false;' href=\"" + href + "\" title=\"" + title + "\">" + text + "</a>";
    }

    marked.setOptions({
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    })

    export default {
        computed: {
            title () { return this.$store.state.card.title },
            text () { return this.$store.state.card.text },
            compiledMarkdown: function () {
                return marked(this.text, { sanitize: true })
            }
        },
        methods: {
            onEdit: function(){
                this.$store.dispatch('startEdit')
            },
            onClose: function(){
                if (confirm("このカードを削除してもよろしいですか？\n※ 一度削除すると復元できません")) {
                    this.$store.dispatch('closeCard')
                    remote.getCurrentWindow().close()
                }
            },
        },
    }

</script>
