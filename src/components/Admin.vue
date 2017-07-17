<template>
  <div class="content-group">
    <div class="content">
      <div class="header">组名</div>
      <div class="input-btn-group">
        <input class="styled" v-model="name">
        <button class="styled" @click="updateName" :disabled="name === originalName"><i class="material-icons">update</i> 更新</button>
      </div>
    </div>
    <div class="content">
      <div class="header">支付密码</div>
      <div class="input-btn-group">
        <input class="styled" v-model="originalPass" type="password" placeholder="原密码 (未设请留空)">
        <input class="styled" v-model="pass" type="password" placeholder="新密码">
        <button class="styled" @click="updatePass" :disabled="!pass"><i class="material-icons">update</i> 更新</button>
      </div>
    </div>
    <div class="content">
      <div class="header">人员设置</div>
      <table class="styled">
        <thead>
          <td><span class="member-name">名前</span></td>
          <td>称谓</td>
          <td class="center">信息</td>
          <td class="center">转账</td>
          <td class="center">出售</td>
          <td class="center">发布</td>
          <td class="center">更新</td>
        </thead>
        <tbody>
          <tr v-for="(member, i) of members" v-if="members">
            <td><span class="member-name">{{ member.name }}</span></td>
            <td><input class="styled" v-model="member.title"></td>
            <td class="center"><input class="styled" type="checkbox" v-model="member.grants.message"></td>
            <td class="center"><input class="styled" type="checkbox" v-model="member.grants.transfer"></td>
            <td class="center"><input class="styled" type="checkbox" v-model="member.grants.sell"></td>
            <td class="center"><input class="styled" type="checkbox" v-model="member.grants.publish"></td>
            <td class="center"><i class="material-icons member-update" @click="update(i)" :class="{ disabled: isUnchanged(i) }">update</i></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import backend from '../backend';

export default {
  props: {
    user: Object,
  },
  data() {
    return {
      name: null,
      originalName: null,

      originalPass: '',
      pass: '',

      members: null,
      originalMembers: null,
    };
  },
  created() {
    this.$parent.loading();
    backend.get(`/group/${this.user.group._id}/detail`).then((resp) => {
      this.members = resp.members;
      this.originalMembers = JSON.parse(JSON.stringify(resp.members));
      this.name = resp.group.name;
      this.originalName = resp.group.name;
      this.$parent.setTitle('组设置');
    });
  },
  methods: {
    isUnchanged(i) {
      const m = this.members[i];
      const om = this.originalMembers[i];
      return m.title === om.title
        && m.grants.message === om.grants.message
        && m.grants.transfer === om.grants.transfer
        && m.grants.sell === om.grants.sell
        && m.grants.publish === om.grants.publish;
    },
    update(i) {
      if(this.isUnchanged(i)) return;
      const m = this.members[i];
      backend.post(`/user/${m._id}/membership`, m).then(() => {
        this.originalMembers.splice(i, 1, JSON.parse(JSON.stringify(m)));
      });
    },

    updateName() {
      if(this.name === this.originalName)
        return;
      backend.post(`/group/${this.user.group._id}/name`, {
        name: this.name,
      }).then((resp) => {
        if(!resp.success)
          this.$parent.info(`错误: ${resp.err}`);
        else
          this.originalName = this.name;
      });
    },

    updatePass() {
      backend.post(`/group/${this.user.group._id}/pass`, {
        original: this.originalPass,
        pass: this.pass,
      }).then((resp) => {
        if(!resp.success)
          this.$parent.info(`错误: ${resp.err}`);
        else {
          this.$parent.info('更新成功~');
          this.pass = '';
          this.originalPass = '';
        }
      });
    },
  },
};
</script>

<style lang="scss">
.member-name {
  font-weight: bold;
}

.member-update {
  opacity: 0.7;
  transition: opacity 0.2s ease;
  cursor: pointer;
  vertical-align: middle;

  &:hover {
    opacity: 0.87;
  }

  &.disabled {
    opacity: 0.3;
    cursor: default;
    &:hover {
      opacity: 0.3;
    }
  }
}
</style>
