<template>
  <div class="content-group">
    <div class="content">
      <div class="header">密码</div>
      <div class="input-btn-group">
        <input class="styled" v-model="pass" type="password" placeholder="原密码">
        <input class="styled" v-model="newPass" type="password" placeholder="新密码">
        <button class="styled" @click="updatePass" :disabled="!pass || !newPass"><i class="material-icons">update</i> 更新</button>
      </div>
    </div>
  </div>
</template>

<script>
import backend from '../backend';

export default {
  data() {
    return {
      pass: '',
      newPass: '',
    };
  },

  created() {
    this.$parent.setTitle('账户');
  },

  methods: {
    updatePass() {
      const user = backend.fetchUser();
      console.log(user);
      backend.post(`/user/${user._id}/pass`, {
        pass: this.pass,
        new: this.newPass,
      }).then((resp) => {
        if(resp.success) {
          this.$parent.info('修改成功~');
          this.$parent.logout();
        } else if(resp.err === 'WRONG_PASS')
          this.$parent.info('原密码错误');
        else throw resp.err;
      });
    },
  },
};
</script>
