import Vue from 'vue';
import Router from 'vue-router';

import Home from '../components/Home';
import Login from '../components/Login';
import Admin from '../components/Admin';

import backend from '../backend';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
    },
  ],
});

let restored = false;

router.beforeEach((to, from, next) => {
  if(restored) {
    next();
    return;
  }

  restored = true;

  backend.get('/auth').then((resp) => {
    if(resp._id) {
      backend.registerUser(resp);

      if(to.name === 'Login') next({ name: 'Home' });
      else next();
    } else next({ name: 'Login' });
  });
});

export default router;
