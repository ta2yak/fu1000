<template>
    <div class="full">
        <div id="menu" class="ui fluid top compact fixed menu borderless inverted teal draggable">
            <div class="item">
                <i class="hashtag icon"></i> 
                <div class="ui input no-drag">
                <input type="text" placeholder="タイトル" :value="title" @input="updateTitle"/>
                </div>
            </div>

            <div class="item right no-drag">
                <div class="right floated ui icon buttons compact">
                <button v-on:click="onSave" class="ui button compact">
                    <i class="checkmark icon">&nbsp;</i>
                </button>
                </div>
            </div>
        </div>

        <form id="content" class="ui form full">
            <div class="field full">
                <textarea :value="text" @input="updateText" placeholder="マークダウン形式で入力できます" class="full markdown-editor"></textarea>
            </div>
        </form>
    </div>
</template>

<script>
    const electron = require("electron")
    const remote = electron.remote
    const ipc = electron.ipcRenderer
    const windowManager = remote.require('electron-window-manager')
    const _ = require("lodash")

    export default {
        computed: {
            title () { return this.$store.state.card.title },
            text () { return this.$store.state.card.text },
        },
        methods: {
            updateTitle: _.debounce(function (e) {
                this.$store.dispatch('updateTitle', e.target.value)
            }, 300),
            updateText: _.debounce(function (e) {
                this.$store.dispatch('updateText', e.target.value)
            }, 300),
            onSave: function(){

                if (this.title == "") {
                    confirm("タイトルは必ず入力してください")
                    return
                }

                this.$store.dispatch('saveCard', {title: this.title, text: this.text})

            },
        },
    }
</script>
