<template>
  <div class="container">
    <div class="lucky-wheel">
      <div class="lucky-title"></div>
      <div class="wheel-main">
        <div class="wheel-pointer-box">
          <div class="wheel-pointer" @click="rotate_handle()" :style="{transform:rotate_angle_pointer,transition:rotate_transition_pointer}"></div>
        </div>
        <div class="wheel-bg" :style="{transform:rotate_angle,transition:rotate_transition}">
          <div class="prize-list">
            <div class="prize-item" v-for="(item,index) in prize_list" :key="index">
              <div class="prize-pic">
                <img :src="item.icon">
              </div>
              <div class="prize-count" v-if="item.quantily">
                {{item.quantily}}
              </div>
              <!--<div class="prize-type">
                {{item.name}}
              </div>-->
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="main-bg"></div>
      <div class="bg-p"></div>
      <div class="content">
        <div class="lottery_ticket">{{ $t('message.lottery_ticket', { count: lottery_ticket }) }}</div>
      </div>
      <div class="tip">
        <div class="tip-title">{{ $t('message.guild') }}</div>
        <div class="tip-content" v-html="description"></div>
      </div>
    </div>
    <div class="toast" v-show="toast_control">
      <div class="toast-container">
        <img :src="toast_pictrue" class="toast-picture">
        <div class="close" @click="close_toast()"></div>
        <div class="toast-title">
          {{ toast_title }}
        </div>
        <div class="toast-btn">
          <div class="toast-cancel" @click="close_toast">{{ $t('message.close') }}</div>
        </div>
      </div>
    </div>
    <div class="toast-mask" v-show="toast_control"></div>
  </div>
</template>
<script>
  import axios from 'axios'

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })

  export default {
    data() {
      return {
        description: '',
        prize_list: {},
        toast_control: false,
        hasPrize: false,
        start_rotating_degree: 0,
        rotate_angle: 0,
        start_rotating_degree_pointer: 0,
        rotate_angle_pointer: 0,
        rotate_transition: "transform 15s ease-in-out",
        rotate_transition_pointer: "transform 20s ease-in-out",
        click_flag: true,
        index: 0,
        message: '',
        lottery_ticket: 0
      }
    },
    created() {
      this.init_prize_list()
    },
    computed: {
      toast_title() {
        if (this.message) {
          return this.message
        }

        return this.hasPrize
          ? this.$t('message.win', { prize: this.prize_list[this.index].quantily + ' ' + this.prize_list[this.index].name })
          : this.$t('message.lost')
      },
      toast_pictrue() {
        return this.hasPrize
          ? require("../assets/img/congratulation.png")
          : require("../assets/img/sorry.png")
      }
    },
    methods: {
      init_prize_list() {
        const vue = this
        this.update_tickets()

        axios.get(CONFIG.prize_list).then(function (response) {
          vue.description = response.data.data.description
          vue.prize_list  = response.data.data.prize_list
        })
      },
      update_tickets() {
        const vue = this

        axios.get(CONFIG.tickets).then(function (response) {
          if (response.data.error === 0) {
            vue.lottery_ticket = formatter.format(response.data.price)
          }
        })
      },
      rotate_handle() {
        if (!this.click_flag) return

        const vue = this

        vue.rotate_transition = "transform 15s ease-in-out"
        vue.rotating(10)
        vue.click_flag = false

        axios.get(CONFIG.rotate).then(function (response) {
          if (response.data.error !== 0) {
            vue.hasPrize          = false
            vue.message           = response.data.message
            vue.rotate_transition = "transform 1s ease-in-out"
            vue.rotate_angle      = "rotate(0deg)"
            vue.toast_control     = true
            vue.click_flag        = true
            return false
          }

          vue.prize_list.forEach(function (value, key) {
            if (value.id === response.data.data.id) {
              vue.update_tickets()

              // Rotating
              vue.message = ''
              vue.index   = key
              vue.rotating(1)

              // End game
              vue.rotate_transition = "transform 2s ease-in-out"
              setTimeout(function () {
                vue.click_flag = true
                vue.game_over()
              }, 2 * 1000)
            }
          })
        })
      },
      rotating(rand_circle) {
        console.log('rotating...')

        let result_index = this.index
        let result_angle = [337.5, 292.5, 247.5, 202.5, 157.5, 112.5, 67.5, 22.5]

        let rotate_angle           = this.start_rotating_degree + rand_circle * 360 + result_angle[result_index] - this.start_rotating_degree % 360
        this.start_rotating_degree = rotate_angle
        this.rotate_angle          = "rotate(" + rotate_angle + "deg)"
      },
      game_over() {
        this.toast_control = true
        this.hasPrize      = this.prize_list[this.index].isPrize
      },
      close_toast() {
        this.toast_control = false
      }
    }
  }
</script>
<style scoped>
  .container {
    width: 100%;
  }

  .lucky-wheel {
    width:           100%;
    height:          31.5625rem;
    background:      rgb(252, 207, 133) url("../assets/img/color_pillar.png") no-repeat center bottom;
    background-size: 100%;
    padding-top:     1.5625rem;
  }

  .lucky-title {
    width:           100%;
    height:          8.125rem;
    background:      url("../assets/img/lucky_title.png") no-repeat center top;
    background-size: 100%;
  }

  .wheel-main {
    display:         flex;
    align-items:     center;
    justify-content: center;
    position:        relative;
  }

  .wheel-bg {
    width:           18.4375rem;
    height:          18.4375rem;
    background:      url("../assets/img/draw_wheel.png") no-repeat center top;
    background-size: 100%;
    color:           #fff;
    font-weight:     500;
    display:         flex;
    flex-direction:  column;
    justify-content: center;
    align-content:   center;
    transition:      transform 3s ease;
  }

  .wheel-pointer-box {
    position:  absolute;
    top:       50%;
    left:      50%;
    z-index:   100;
    transform: translate(-50%, -60%);
    width:     5.3125rem;
    height:    5.3125rem;
  }

  .wheel-pointer {
    width:            5.3125rem;
    height:           5.3125rem;
    background:       url("../assets/img/draw_btn.png") no-repeat center top;
    background-size:  100%;
    transform-origin: center 60%;
  }

  .wheel-bg div {
    text-align: center;
  }

  .prize-list {
    width:    100%;
    height:   100%;
    position: relative;
  }

  .prize-list .prize-item {
    position: absolute;
    top:      0;
    left:     0;
    z-index:  2;
  }

  .prize-list .prize-item:first-child {
    top:       0;
    left:      8.3125rem;
    transform: rotate(20deg);
  }

  .prize-list .prize-item:nth-child(2) {
    top:       2.8rem;
    left:      10.8rem;
    transform: rotate(67deg);
  }

  .prize-list .prize-item:nth-child(3) {
    top:       6.4rem;
    left:      10.6rem;
    transform: rotate(-250deg);
  }

  .prize-list .prize-item:nth-child(4) {
    top:       9rem;
    left:      8.2125rem;
    transform: rotate(-210deg);
  }

  .prize-list .prize-item:nth-child(5) {
    top:       9.2125rem;
    left:      4.4rem;
    transform: rotate(-160deg);
  }

  .prize-list .prize-item:nth-child(6) {
    top:       6.3875rem;
    left:      1.9rem;
    transform: rotate(-111deg);
  }

  .prize-list .prize-item:nth-child(7) {
    top:       2.8rem;
    left:      1.8125rem;
    transform: rotate(-69deg);
  }

  .prize-list .prize-item:nth-child(8) {
    top:       0;
    left:      4.5rem;
    transform: rotate(-20deg);
  }

  .prize-item {
    width:  5.875rem;
    height: 9rem;
  }

  .prize-pic img {
    width:      4.0625rem;
    height:     2.5rem;
    margin-top: 1.5625rem;
  }

  .prize-count {
    font-size: 0.875rem;
  }

  .prize-type {
    font-size: 0.75rem;
  }

  .main {
    position:       relative;
    width:          100%;
    min-height:     14.25rem;
    background:     rgb(243, 109, 86);
    padding-bottom: 1.6875rem;
  }

  .main-bg {
    width:           100%;
    height:          6.5625rem;
    position:        absolute;
    top:             -3.4375rem;
    left:            0;
    background:      url("../assets/img/luck_bg.png") no-repeat center top;
    background-size: 100%;
  }

  .bg-p {
    width:      100%;
    height:     2.95rem;
    background: rgb(252, 207, 133);
  }

  .content {
    position:     absolute;
    top:          0.175rem;
    left:         0;
    background:   rgb(243, 109, 86);
    width:        100%;
    height:       5.1875rem;
    font-size:    1.125rem;
    color:        #ffeb39;
    padding-left: 6.75rem;
  }

  .content div {
    text-align: left;
  }

  .tip {
    position: relative;
    margin:   2.5rem auto 0;
    width:    17.5rem;
    border:   1px solid #fbc27f;
  }

  .tip-title {
    position:   absolute;
    top:        -1rem;
    left:       50%;
    transform:  translate(-50%, 0);
    font-size:  1rem;
    color:      #fccc6e;
    background: rgb(243, 109, 86);
    padding:    0.3125rem 0.625rem;
  }

  .tip-content {
    padding:     1.5625rem 0.625rem;
    font-size:   0.875rem;
    color:       #fff8c5;
    line-height: 1.5;
  }

  .toast-mask {
    position:   fixed;
    top:        0;
    left:       0;
    background: rgba(0, 0, 0, 0.6);
    z-index:    10000;
    width:      100%;
    height:     100%;
  }

  .toast {
    position:      fixed;
    top:           50%;
    left:          50%;
    z-index:       20000;
    transform:     translate(-50%, -50%);
    width:         15.4375rem;
    border-radius: 0.3125rem;
    padding:       0.3125rem;
    background:    rgb(252, 244, 224);
  }

  .toast-container {
    position: relative;
    width:    100%;
    height:   100%;
    border:   1px dotted #fccc6e;
  }

  .toast-picture {
    position: absolute;
    top:      -6.5rem;
    left:     -1.5rem;
    width:    18.75rem;
    height:   8.5625rem;
  }

  .toast-pictrue-change {
    position: absolute;
    top:      -1.5rem;
    left:     -1.375rem;
    width:    17.5rem;
    height:   3.125rem;
  }

  .toast-title {
    padding:    2.8125rem 0;
    font-size:  18px;
    color:      #fc7939;
    text-align: center;
  }

  .toast-btn {
    display:         flex;
    align-items:     center;
    justify-content: center;
    margin-bottom:   0.9375rem;
  }

  .toast-btn div {
    background-image: -moz-linear-gradient(
                        -18deg,
                        rgb(242, 148, 85) 0%,
                        rgb(252, 124, 88) 51%,
                        rgb(252, 124, 88) 99%
                      );
    background-image: -ms-linear-gradient(
                        -18deg,
                        rgb(242, 148, 85) 0%,
                        rgb(252, 124, 88) 51%,
                        rgb(252, 124, 88) 99%
                      );
    background-image: -webkit-linear-gradient(
                        -18deg,
                        rgb(242, 148, 85) 0%,
                        rgb(252, 124, 88) 51%,
                        rgb(252, 124, 88) 99%
                      );
    box-shadow:       0 4px 0 0 rgba(174, 34, 5, 0.7);
    width:            4.6875rem;
    height:           1.875rem;
    border-radius:    1.875rem;
    text-align:       center;
    line-height:      1.875rem;
    color:            #fff;
  }

  .close {
    position:        absolute;
    top:             -0.9375rem;
    right:           -0.9375rem;
    width:           2rem;
    height:          2rem;
    background:      url("../assets/img/close_store.png") no-repeat center top;
    background-size: 100%;
  }
</style>
