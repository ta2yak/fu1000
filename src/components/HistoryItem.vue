<template>
    <div class="card">
        <div class="content">
            <div class="header">{{ title }}</div>
            <div class="meta">{{ fromNowString }}</div>
            <div class="description">
            {{ text }}
            </div>
        </div>
        <div class="ui bottom attached button pink" v-on:click="restoreCard">
            <i class="add icon"></i>
            この内容で新しいカードを作る
        </div>
    </div>
</template>

<script>
    const electron = require("electron")
    const remote = electron.remote
    const _ = require("lodash")

    export default {
        props: ['title', 'updatedAt', 'text'],
        computed: {
            fromNowString: function () {
                return moment(this.updatedAt).fromNow()
            }
        },
        methods: {
            restoreCard: _.debounce( function(e) {
                this.$store.dispatch('restoreCard', {title: this.title, text: this.text})
            }, 300),
        },
    }
</script>
