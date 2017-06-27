<template>
    <div class="container">
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
        components: {
            Loader,
            Viewer,
            Editor,
        },
        computed: {
            title () { return this.$store.state.card.title },
            width () { return this.$store.state.card.width },
            height () { return this.$store.state.card.height },
            x () { return this.$store.state.card.x },
            y () { return this.$store.state.card.y },
            loaded () { return this.$store.state.card.loaded },
            editable () { return this.$store.state.card.editable },
        },
        mounted() {
            this.$store.dispatch('fetchCard')
            remote.getCurrentWindow().setSize(this.width, this.height)
            remote.getCurrentWindow().setPosition(this.x, this.y)
            remote.getCurrentWindow().setTitle(this.title || "タイトルを入力してください")

            let dispatcher = this.$store
            remote.getCurrentWindow().on('resize', function (e) {
                dispatcher.dispatch('updateCardSize')
            })

            remote.getCurrentWindow().on('move', function (e) {
                dispatcher.dispatch('updateCardPosition')
            })

        },
    }

</script>
