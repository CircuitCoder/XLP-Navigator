<template>
  <div id="app">
    <div id="title-bar" :class="{ extended: onTop }">
      <div class="content">
        <div class="title">
          {{ title }}
        </div>

        <div class="input-btn-group header-search" :class="{ hidden: !search }">
          <i class="material-icons input-icon">search</i>
          <input class="styled no-margin" v-model="searchContent" :disabled="!search">
        </div>

        <transition name="opacity">
          <div class="util" v-if="user">
            <nav>
              <router-link tag="i" :to ="{ name: 'Home' }" class="material-icons">home</router-link>
              <router-link tag="i" :to ="{ name: 'Shop', query: { page: 1 } }" class="material-icons">store</router-link>
              <router-link tag="i" :to ="{ name: 'Admin' }" v-if="grants('admin')" class="material-icons">settings</router-link>
              <router-link tag="i" :to ="{ name: 'Account' }" class="material-icons">person</router-link>
              <i class="material-icons" @click="logout">flight_land</i>
            </nav>
          </div>
        </transition>
      </div>
    </div>

    <div class="router-slot">
      <transition name="opacity" mode="out-in">
        <router-view
          :user="user"
          ></router-view>
      </transition>
    </div>

    <div class="info-list">
      <transition-group name="info">
        <div class="info" v-for="i of infos" :key="i.id" @click="uninfo(i.id)">{{ i.msg }}</div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import router from './router';

import backend from './backend';
import util from './util';

let infocount = 0;

export default {
  name: 'app',

  data: () => ({
    onTop: true,
    title: '欢迎!',
    search: false,
    searchContent: '',

    infos: [],

    user: null,
  }),

  created() {
    window.addEventListener('scroll', () => {
      this.onTop = window.scrollY === 0;
    });

    const u = backend.fetchUser();
    if(u) this.login(u);
    else backend.onUser(user => this.login(user));
  },

  watch: {
    searchContent() {
      if(!this.search) return;

      util.debounce('search', () => {
        const nr = util.cpRoute(this.$route);
        nr.query.search = this.searchContent;
        nr.query.page = 1;
        this.$router.push(nr);
      }, 500);
    },
  },

  methods: {
    loading(resetSearch = true) {
      this.title = '加载中...';
      if(resetSearch) {
        this.search = false;
        this.searchContent = '';
      }
    },

    setTitle(title, resetSearch = true) {
      this.title = title;
      if(resetSearch) {
        this.search = false;
        this.searchContent = '';
      }
    },

    setSearch() {
      this.search = true;
      this.searchContent = this.$route.query.search;
      if(!this.searchContent) this.searchContent = '';
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
        backend.detachUser();
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

.router-slot {
  margin-top: 120px;
  overflow-x: hidden;
}

.title {
  font-weight: bold;
  font-size: 18px;
  line-height: 60px;
}

.info-list {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 200px;
  z-index: 5000;

  .info {
    font-weight: bold;
    font-size: 14px;
    color: rgba(0,0,0,.54);
    background: rgba(255,255,255,0.8);

    word-break: break-word;

    box-sizing: border-box;

    margin: 10px 0;

    border-radius: 2px;

    padding: 20px;
    box-shadow: rgba(0,0,0,.12) 0 4px 6px;

    cursor: pointer;

    transition: transform 0.5s, opacity 0.5s;
    display: block;

    white-space: pre-line;
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

.header-search {
  flex: 1;
  margin: 0 20px;

  transition: opacity 0.2s;

  &.hidden {
    opacity: 0;
  }
}
</style>
