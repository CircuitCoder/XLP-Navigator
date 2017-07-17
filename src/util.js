const debounceId = new Map();

export default {
  debounce(name, cb, time) {
    if(debounceId.has(name))
      window.clearTimeout(debounceId.get(name));

    debounceId.set(name, window.setTimeout(() => {
      debounceId.delete(name);
      cb();
    }, time));
  },

  cpRoute(r) {
    return {
      name: r.name,
      params: { ...r.params },
      query: { ...r.query },
    };
  },
};
