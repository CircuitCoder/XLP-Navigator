<template>
  <img :src="src" @load="show"></img>
  <i class="avatar-fallback">{{ fallback }}</i>
</template>

<script>
export default {
  props: {
    src: String,
    fallback: String,
  },

  data() {
    // TODO: impl
    return {
    }
  },

  methods: {
  }
};
</script>

<style>
</style>
