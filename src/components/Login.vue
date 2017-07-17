<template>
  <div class="content">
    <div class="login-dialog">
      <div class="login-internal">
        <input class="styled" v-model="username" type="text" placeholder="用户名" @keyup.enter="login">
        <input class="styled" v-model="pass" type="password" placeholder="密码" @keyup.enter="login">
        <button class="styled" @click="login"><i class="material-icons">flight_takeoff</i>登陆</button>
      </div>
    </div>
  </div>
</template>

<script>
import backend from '../backend';
import router from '../router';

export default {
  data: () => ({
    username: '',
    pass: '',
  }),

  created() {
    this.$parent.setTitle('登陆');
  },

  methods: {
    login() {
      if(!this.username) {
        this.$parent.info('请填写用户名');
        return;
      }
      if(!this.pass) {
        this.$parent.info('请填写密码');
        return;
      }

      backend.post('/auth', { username: this.username, pass: this.pass }).then((resp) => {
        if(!resp.success)
          this.$parent.info('用户名或密码错误');
        else {
          this.$parent.login(resp.user);
          router.replace({ name: 'Home' });
        }
      });
    },
  },
};
</script>

<style>
.login-dialog {
  min-height: calc(100vh - 240px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-internal {
  width: 250px;
}
</style>
