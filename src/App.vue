<template>
  <div id="app">
    <div id="title-bar" :class="{ extended: onTop }">
      <div class="content">
        <div class="title">
          {{ title }}
        </div>

        <div class="util" v-if="user">
          <nav>
            <router-link tag="i" :to ="{ name: 'Admin' }" v-if="grants('admin')" class="material-icons">assignment_ind</router-link>
            <i class="material-icons" @click="logout">flight_land</i>
          </nav>
        </div>
      </div>
    </div>

    <div class="router-slot">
      <transition name="opacity">
        <router-view
          :user="user"
          ></router-view>
      </transition>
    </div>

    <div class="info-list">
      <transition-group name="info">
        <div class="info" v-for="i of infos" :key="i.id" @click="uninfo(i.id)">
          {{ i.msg }}
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import router from './router';

import backend from './backend';

let infocount = 0;

export default {
  name: 'app',

  data: () => ({
    onTop: true,
    title: '欢迎!',
    search: false,

    infos: [],

    user: null,
  }),

  created() {
    window.addEventListener('scroll', () => {
      this.onTop = window.scrollY === 0;
    });

    router.replace({ name: 'Login' });
  },

  methods: {
    loading() {
      this.title = '加载中...';
      this.search = false;
    },

    setTitle(title) {
      this.title = title;
    },

    info(info, delay = 2000) {
      const id = infocount;
      infocount += 1;
      const obj = { msg: info, id };
      this.infos.push(obj);

      setTimeout(() => {
        this.uninfo(id);
      }, delay);
    },

    uninfo(id) {
      const index = this.infos.findIndex(i => i.id === id);
      if(index < 0) return;
      this.infos.splice(index, 1);
    },

    login(user) {
      this.user = user;
    },

    logout() {
      backend.delete('/auth').then(() => {
        this.user = null;
        router.push({ name: 'Login' });
      });
    },

    // helpers

    grants(g) {
      return this.user && this.user.grants && this.user.grants[g];
    },
  },
};
</script>

<style lang="scss">
@import './styles/shared.scss';

body {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;

  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#title-bar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;

  height: 60px;
  transition: box-shadow 0.2s ease, height 0.2s ease;

  display: flex;
  align-items: center;

  box-shadow: rgba(0,0,0,.12) 0 4px 6px;

  background: rgba(255,255,255,0.8);

  &.extended {
    height: 100px;
    box-shadow: none;
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.content {
  max-width: 1080px;
  width: 100vw;
  margin: 0 auto;
  padding: 0 40px;
  box-sizing: border-box;
}

.router-slot {
  margin-top: 120px;
  overflow-x: hidden;
}

.title {
  font-weight: bold;
  font-size: 18px;
  line-height: 60px;
  flex: 1;
}

.info-list {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;

  .info {
    font-weight: bold;
    font-size: 14px;
    color: rgba(0,0,0,.54);
    background: rgba(255,255,255,0.8);
    z-index: 1000;

    word-break: break-word;

    box-sizing: border-box;

    margin: 10px 0;

    border-radius: 2px;

    padding: 20px;
    box-shadow: rgba(0,0,0,.12) 0 4px 6px;

    cursor: pointer;
  }
}

.util {
  nav {
    .material-icons {
      line-height: 60px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity .2s ease;

      &:hover {
        opacity: 0.87;
      }
    }
  }
}
</style>
