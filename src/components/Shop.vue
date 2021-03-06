<template>
  <div class="content">
    <transition-group tag="div" class="pager" name="page">
      <button class="styled page" v-for="p of pageRange" :key="p" @click="gotoPage(p)" :class="{ selected: p == $route.query.page }">{{ p }}</button>
    </transition-group>
    <div class="items">
      <div class="item" v-for="item of items">
        <div class="item-info">
          <div class="item-name">
            {{ item.name }}
          </div>
          <div class="item-remaining">剩余: {{ item.left }}</div>
          <div class="item-manip">
            <div class="item-add" @click="add(item)">
              <i class="material-icons item-cart">add_shopping_cart</i>
              添加{{ deltaCount === 1 ? '' : ` ${deltaCount} ` }}至购物车
            </div>
            <transition name="opacity">
              <div class="item-dec" @click="del(item)" v-if="cart[item._id]">移除 {{ deltaCount === 1 ? '' : ` ${deltaCount} ` }}(已有 {{ cart[item._id].count }} 个)</div>
            </transition>
          </div>
        </div>
        <div class="item-price">
          {{ Number(item.price).toFixed(2) }}
        </div>
      </div>
    </div>
    <transition-group tag="div" class="pager" name="page">
      <button class="styled page" v-for="p of pageRange" :key="p" @click="gotoPage(p)" :class="{ selected: p == $route.query.page }">{{ p }}</button>
    </transition-group>

    <transition name="opacity">
      <div class="bottom-sheet-backboard" v-if="cartOpen" @click="toggleCart()"></div>
    </transition>
    <div class="bottom-sheet" :class="{ extended: cartOpen }">
      <div class="bottom-sheet-handle-container">
        <div class="bottom-sheet-handle" @click="toggleCart()">购物车</div>
      </div>
      <div class="bottom-sheet-content">
        <div class="cart-status">
          <div class="content">
            <div class="cart-tot">
              <div class="cart-tot-hint">共计: </div>
              <div class="cart-tot-number">{{ Number(getTot()).toFixed(2) }}</div>
            </div>
            <button class="styled cart-btn" @click="submit" :disabled="cartEmpty"><i class="material-icons">done</i> 下单</button>
          </div>
        </div>
        <div class="cart">
          <div class="content">
            <div class="cart-item" v-for="(entry, id) in cart" :key="id">
              <div class="cart-item-name">{{ entry.item.name }}</div>
              <div class="cart-item-price">{{ Number(entry.item.price).toFixed(2) }}</div>
              <div class="input-btn-group">
                <button class="styled" @click="del(entry.item)">-</button>
                <input class="styled cart-item-count" disabled v-model="entry.count">
                <button class="styled" @click="add(entry.item)">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import backend from '../backend';
import util from '../util';

export default {
  data() {
    return {
      items: [],
      search: '',
      pages: 0,
      cart: {},

      cartOpen: false,

      alt: false,
      shift: false,
    };
  },

  created() {
    this.fetch();
    this.$parent.setTitle('商城');
    this.$parent.setSearch();
  },

  beforeRouteEnter(from, to, next) {
    next((vm) => {
      document.addEventListener('keydown', vm.kdown);
      document.addEventListener('keyup', vm.kup);
    });
  },

  beforeRouteLeave(from, to, next) {
    document.removeEventListener('keydown', this.kdown);
    document.removeEventListener('keyup', this.kup);

    next();
  },

  watch: {
    $route: 'fetch',
  },

  methods: {
    kdown(e) {
      if(e.key === 'Alt')
        this.alt = true;
      else if(e.key === 'Shift')
        this.shift = true;
    },

    kup(e) {
      if(e.key === 'Alt')
        this.alt = false;
      else if(e.key === 'Shift')
        this.shift = false;
    },

    fetch() {
      const queries = {
        page: this.$route.query.page,
        search: this.$route.query.search,
      };

      if(this.$route.all) queries.all = true;

      backend.get('/item', queries).then((resp) => {
        this.items = resp.items;
        this.pages = resp.pages;
      });
    },

    gotoPage(p) {
      const nr = util.cpRoute(this.$route);
      nr.query.page = p;
      this.$router.push(nr);
    },

    add(item) {
      let idesc = this.cart[item._id];
      if(!idesc) idesc = { item, count: this.deltaCount };
      else idesc.count += this.deltaCount;

      if(idesc.count > idesc.item.left) idesc.count = idesc.item.left;
      else this.$set(this.cart, item._id, idesc);
    },

    del(item) {
      const idesc = this.cart[item._id];
      if(!idesc) return;
      idesc.count -= this.deltaCount;

      if(idesc.count <= 0) delete this.cart[item._id];
      else this.$set(this.cart, item._id, idesc);

      if(Object.keys(this.cart).length === 0) this.cartOpen = false;
    },

    toggleCart() {
      this.cartOpen = !this.cartOpen;
    },

    getTot() {
      return Object.keys(this.cart)
        .map(k => this.cart[k])
        .reduce((acc, i) => acc + (i.item.price * i.count), 0);
    },

    submit() {
      const items = Object.keys(this.cart)
        .map(k => this.cart[k])
        .map(e => ({ item: e.item._id, qty: e.count }));
      backend.post('/purchase', { items }).then((resp) => {
        if(resp.success) {
          this.cart = {};
          this.cartOpen = false;

          this.$parent.info(`购买成功~ 组余额为: ${resp.balance}`);
        } else if(resp.err === 'INSUFFICIENT_FUND')
          this.$parent.info(`余额不足: ${resp.balance}`);
        else if(resp.err === 'NOT_ENOUGH_ITEM') {
          const info =
            resp.items.map(i => `${this.cart[i._id].item.name}\n${this.cart[i._id].count} / ${i.left}`)
            .join('\n\n');
          this.$parent.info(`物品库存不足，可能有人刚下单:\n\n ${info}`);
        }
      });
    },
  },

  computed: {
    cartEmpty() {
      return Object.keys(this.cart).length === 0;
    },

    deltaCount() {
      if(this.shift)
        return 20;
      if(this.alt)
        return 5;
      return 1;
    },

    pageRange() {
      // Largest range = +- 2
      const midpoint = parseInt(this.$route.query.page, 10);
      let starting = midpoint - 2;
      let ending = midpoint + 2;

      if(starting < 1) starting = 1;
      if(ending > this.pages) ending = this.pages;

      if(starting > ending) return [];

      const result = new Array((ending - starting) + 1);
      for(let i = 0; i < result.length; ++i)
        result[i] = starting + i;

      return result;
    },
  },
};
</script>

<style lang="scss">
.item {
  display: flex;
  padding: 10px 0;

  .item-info {
    flex: 1;
  }
}

.item-name {
  font-weight: bold;
  font-size: 24px;
  color: rgba(0,0,0,.7);
}

.item-manip {
  display: flex;
  margin-top: 4px;

  .item-dec, .item-add {
    display: inline-flex;
    align-items: center;

    cursor: pointer;

    opacity: 0.7;
    transition: opacity 0.2s ease;
    line-height: 24px;

    &:hover {
      opacity: 0.87;
    }
  }

  .item-dec {
    margin-left: 10px;
  }
}

.item-price {
  font-size: 40px;
}

.cart-item {
  display: flex;
  align-items: center;
  .cart-item-name {
    font-size: 16px;
    font-weight: bold;
    flex: 1;
    flex-wrap: wrap;
  }

  input.styled.cart-item-count {
    flex: 0;
    width: 80px;
  }

  .cart-item-price {
    margin: 0 20px;
  }
}

.cart-status {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  border-bottom: rgba(0,0,0,.12) 1px solid;

  > .content {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 80px;

    .cart-tot {
      display: flex;
      align-items: baseline;
      .cart-tot-number {
        font-weight: bold;
        font-size: 28px;
      }
    }

    .cart-btn {
      width: auto;
      margin-left: 20px;
    }
  }
}

.cart {
  position: absolute;
  top: 81px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: visible;
  overflow-x: hidden;

  padding-top: 20px;

  .cart-item-price {
    opacity: 0.3;
  }
}
</style>
