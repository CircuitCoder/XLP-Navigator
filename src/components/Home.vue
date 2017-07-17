<template>
  <div class="content">
    <div class="greeting">
      <div class="greeting-header">
        您好,
        <span class="greeting-title" v-if="user.group">
          {{ user.group.name }} 的 {{ user.title }}
        </span>
      </div>
      <div class="greeting-name">
        {{ user.name }}
      </div>
    </div>
    <div class="hint">
      请点击右上方的导航按钮进入其他页面
      <div class="nav-hints">
        <div class="nav-hint"><i class="material-icons">home</i> - 欢迎页</div>
        <div class="nav-hint"><i class="material-icons">store</i> - 商城</div>
        <div class="nav-hint"><i class="material-icons">settings</i> - 组设置</div>
        <div class="nav-hint"><i class="material-icons">flight_land</i> - 登出</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({ }),
  props: {
    user: Object,
  },
  created() {
    this.$parent.setTitle('欢迎!');
  },
};
</script>

<style lang="scss">
.greeting {
  .greeting-header {
    color: rgba(0,0,0,.54);

    .greeting-title {
      color: rgba(0,0,0,.7);
    }
  }

  .greeting-name {
    font-size: 40px;
  }

  padding: 10px 0 10px 20px;
  border-left: rgba(0,0,0,.3) 5px solid;

  margin-bottom: 20px;
}

.hint {
  color: rgba(0,0,0,.54);
}

.nav-hint {
  line-height: 30px;
  height: 30px;

  .material-icons {
    line-height: 30px;
    margin-right: 2px;
  }

  display: inline-flex;
  align-items: flex-start;

  margin-right: 20px;
}

.nav-hints {
  margin-top: 10px;
}
</style>
