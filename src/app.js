import Wheel from './components/wheel/index.js'

const prizes = [{
  id: '1',
  name: 'iphone 6s',
  image: {
    src: 'http://shd2.shenhudong.com/public/module/shd3.0/bigturntable/images/9.png'
  }
}, {
  id: '2',
  name: 'iphone 8',
  image: {
    src: 'http://shd2.shenhudong.com/public/module/shd3.0/bigturntable/images/9.png'
  }
}, {
  id: '3',
  name: 'iphone 7s',
  image: {
    src: 'http://shd2.shenhudong.com/public/module/shd3.0/bigturntable/images/9.png'
  }
}, {
  id: '4',
  name: 'iphone XR',
  image: {
    src: 'http://shd2.shenhudong.com/public/module/shd3.0/bigturntable/images/9.png'
  }
}]

const buttonImage = 'http://image.wxopen.shenhudong.com/20181205/9f678793932b736dd05012d089c0aa9d.png'
const backgroundImage = 'http://image.wxopen.shenhudong.com/20181205/70579f351afe8ea5e03637bdbea7a20d.png'

export default {
  components: {
    Wheel
  },
  render(h) {
    return (
      <Wheel
        ref="wheel"
        buttonImage={buttonImage}
        backgroundImage={backgroundImage}
        prizes={prizes}
        onClickWheelButton={this.handleClickWheelButton} />
    )
  },
  methods: {
    async handleClickWheelButton() {
      // mock ajax
      const timeout = time => {
        return new Promise(resolve => {
          setTimeout(resolve, time, 'done')
        })
      }

      if (this.isLocked) return false
      this.isLocked = true
      try {
        // add loading...
        await timeout(1000)
        const resp = {
          status: 0,
          id: 'xxxx'
        }

        if (resp.status === 1) {
          await this.$refs.wheel.handleStartRotate({ id: resp.id })
          // do sth.
        }

        if (resp.status === 0) {
          await this.$refs.wheel.handleStartRotate()
          // do sth.
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.isLocked = false
      }
    }
  }
}