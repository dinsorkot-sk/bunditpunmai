<script lang="ts">
export default {
    emits: ['select'],
    methods: {
        open() {
            const input = this.$refs.input as HTMLInputElement | undefined
            input?.click()
        },
        handleChange(event: Event) {
            const input = event.target as HTMLInputElement
            const file = input.files?.[0]

            if (file) {
                this.$emit('select', file)
            }

            input.value = ''
        },
    },
}
</script>

<template>
    <input
        ref="input"
        type="file"
        accept="video/*"
        class="hidden"
        @change="handleChange"
    >
</template>
