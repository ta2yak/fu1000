<template>
    <div>
        <div id="menu" class="ui fluid top compact fixed menu borderless inverted purple">
            <div class="item draggable">
                <i class="history icon"></i> 変更履歴
            </div>

            <div class="item right">
                <div class="right floated ui icon buttons compact">
                <button v-on:click="onClose" class="ui button compact">
                    <i class="close icon">&nbsp;</i>
                </button>
                </div>
            </div>
        </div>

        <div id="content" class="ui cards">
            <history-item
                v-for="(item, index) in sortedItems"
                v-bind:key="item"
                v-bind:title="item.title"
                v-bind:updatedAt="item.updatedAt"
                v-bind:text="item.text"></history-item>
        </div>
    </div>
</template>

<script>
    const electron = require("electron")
    const remote = electron.remote
    const _ = require("lodash")
    const HistoryItem = require("./HistoryItem.vue")

    export default {
        components: {
            HistoryItem,
        },
        computed: {
            sortedItems: function () {
                console.log(this.$store.state.items)
                return _.reverse(this.$store.state.items)
            }
        },
        methods: {
            onClose: () => {
                remote.getCurrentWindow().close()
            },
        },
        mounted() {
            this.$store.dispatch('fetchHistory')
        },
    }

</script>
