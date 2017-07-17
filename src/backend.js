import request from 'superagent';
import config from './config';

export default {
  userListeners: [],

  async get(dir, queries) {
    const resp = await request
    .get(`${config.endpoint}${dir}`)
    .query(queries)
    .withCredentials();

    return resp.body;
  },

  async post(dir, data) {
    const resp = await request
    .post(`${config.endpoint}${dir}`)
    .send(data)
    .withCredentials();

    return resp.body;
  },

  async delete(dir) {
    const resp = await request
    .delete(`${config.endpoint}${dir}`)
    .withCredentials();

    return resp.body;
  },

  registerUser(user) {
    this.user = user;
    this.userListeners.forEach(cb => cb(this.user));
  },

  detachUser() {
    this.user = null;
  },

  fetchUser() {
    return this.user;
  },

  onUser(cb) {
    this.userListeners.push(cb);
  },
};
