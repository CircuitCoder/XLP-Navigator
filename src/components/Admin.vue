<template>
  <div class="content">
    <table class="styled">
      <thead>
       <td><span class="member-name">名</span></td>
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
</template>

<script>
import backend from '../backend';

export default {
  props: {
    user: Object,
  },
  data() {
    return {
      members: null,
      originalMembers: null,
    };
  },
  created() {
    this.$parent.loading();
    backend.get(`/group/${this.user.group._id}/member/detail`).then((resp) => {
      this.members = resp;
      this.originalMembers = JSON.parse(JSON.stringify(resp));
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
