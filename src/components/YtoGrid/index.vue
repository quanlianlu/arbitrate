<template>
  <grid v-bind="$attrs" :cols="cols">
    <slot>
      <grid-item v-for="(item, i) in data" :key="i" @click.native="onClick(item)">
        <div class="yto-grid">
          <div :class="['yto-circle', item.type ? item.type : 'blue']"></div>
          <h3>{{item.value ? item.value : '--'}}{{item.format ? item.format : ''}}
            <svg-icon v-if="item.rank" :iconClass="item.rank" :className="item.rank"/>
          </h3>
          <span>{{item.name}}</span>
        </div>
      </grid-item>
    </slot>
  </grid>
</template>

<script>
  import {
    Grid,
    GridItem
  } from 'vux';

  export default {
    name: 'yto-grid',
    components: {
      Grid,
      GridItem
    },
    props: {
      data: {
        type: Array
      },
      cols: {
        type: Number,
        default: 3
      }
    },
    data() {
      return {};
    },
    computed: {},
    created() {
    },
    methods: {
      onClick(item) {
        this.$emit('on-click', item);
      }
    }
  };
</script>
<style lang="less" rel="stylesheet/less" scoped>
  .yto-grid {
    padding-left: 16px;
    position: relative;
    > h3 {
      font-size: 20px;
      color: #333;
      line-height: normal;
      font-weight: 600;
    }
    > span {
      font-size: 12px;
      color: #666;
    }
    .yto-circle {
      width: 3px;
      height: 3px;
      border-color: #ccc;
      border-style: solid;
      border-width: 2px;
      border-radius: 50%;
      position: absolute;
      left: 2px;
      top: 8px;
    }
    .arrow_rise, .arrow_decline {
      font-size: 18px;
      margin-left: 5px;
    }
    .arrow_rise {
      color: #a3f645;
    }
    .arrow_decline {
      color: #FF9C9C;
    }
    .blue {
      border-color: #4080CA;
    }
    .org {
      border-color: #4080CA;
    }
    .yellow {
      border-color: #FFC74E;
    }
  }
</style>
