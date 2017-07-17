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
          <div class="item-manip">
            <div class="item-add" @click="add(item)">
              <i class="material-icons item-cart">add_shopping_cart</i>
              添加至购物车
            </div>
            <transition name="opacity">
              <div class="item-dec" @click="del(item)" v-if="cart[item._id]">移除 (已有 {{ cart[item._id].count }} 个)</div>
            </transition>
          </div>
        </div>
        <div class="item-price">
          {{ item.price }}
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
      <div class="bottom-sheet-content content">
        <div class="cart-status">
          <div class="content">
            <div class="cart-tot">
              <div class="cart-tot-hint">共计: </div>
              <div class="cart-tot-number">{{ getTot() }}</div>
            </div>
            <button class="styled cart-btn" @click="submit"><i class="material-icons">done</i> 下单</button>
          </div>
        </div>
        <div class="cart">
          <div class="content">
            <div class="cart-item" v-for="(entry, id) in cart" :key="id">
              <div class="cart-item-name">{{ entry.item.name }}</div>
              <div class="cart-item-price">{{ entry.item.price }}</div>
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
    };
  },

  created() {
    this.fetch();
    this.$parent.setTitle('商城');
    this.$parent.setSearch();
  },

  watch: {
    $route: 'fetch',
  },

  methods: {
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
      if(!idesc) idesc = { item, count: 1 };
      else idesc.count += 1;

      this.$set(this.cart, item._id, idesc);
    },

    del(item) {
      const idesc = this.cart[item._id];
      --idesc.count;

      if(idesc.count === 0) delete this.cart[item._id];
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
      // TODO: impl
    },
  },

  computed: {
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

  > .content {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 80px;
    border-bottom: rgba(0,0,0,.12) 1px solid;

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

  .cart-item-price {
    opacity: 0.3;
  }
}
</style>
