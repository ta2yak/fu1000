<template>
    <div>
        <template v-if="!loaded">
            <loader></loader>
        </template>
        <template v-else>

            <!-- 表示中の表示 -->
            <template v-if="!editable">
                <viewer></viewer>
            </template>
            <!-- 編集中の表示 -->
            <template v-else>
                <editor></editor>
            </template>

        </template>
    </div>
</template>

<script>
    const electron = require('electron')
    const remote = electron.remote
    const Loader = require('./Loader.vue')
    const Viewer = require('./Viewer.vue')
    const Editor = require('./Editor.vue')

    export default {
        data() {
            return {
                title: this.$store.state.title,
                width: this.$store.state.width,
                height: this.$store.state.height,
                x: this.$store.state.x,
                y: this.$store.state.y,
                loaded: this.$store.state.loaded,
                editable: this.$store.state.editable,
            }
        },
        updated() {
            this.$store.dispatch('fetchCard')
            remote.getCurrentWindow().setSize(this.width, this.height)
            remote.getCurrentWindow().setPosition(this.x, this.y)
            remote.getCurrentWindow().setTitle(this.title || "タイトルを入力してください")
        }
    }

    remote.getCurrentWindow().on('resize', function (e) {
        this.$store.dispatch('updateCardSize')
    })

    remote.getCurrentWindow().on('move', function (e) {
        this.$store.dispatch('updateCardPosition')
    })

</script>
