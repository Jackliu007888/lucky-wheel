import './index.styl'

const ROTATE_TIME = 6000 // 旋转时间 ms
const MAX_SPLIT_NUMS = 8 // 圆盘最大切割份数
const BASE_ROTATE_ANGLE = 20 * 360 // 每次旋转基本角度

const getVirtualPrize = () => ({
  name: '谢谢参与',
  image: {
    src: 'http://image.wxopen.shenhudong.com/20181210/9c59cb986335af0c7cdda8c0e9196f1e.png'
  },
  id: '-10010'
})

/**
 * 根据圆心，半径，旋转角度，计算圆周上的点旋转 angleInDegrees 后的坐标
 * @param {number} centerX 圆心的x坐标
 * @param {number} centerY 圆心的y坐标
 * @param {number} radius 半径
 * @param {number} angleInDegrees 旋转角度 0-360
 * @return {number} pos.x x坐标
 * @return {number} pos.y y坐标
 */
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}

/**
 * 绘制 svg path d 属性值
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {number} startAngle
 * @param {number} endAngle
 * @return {string} svg path d 属性值
 */
const getPathDrawn = ({cx, cy, radius, startAngle, endAngle}) => {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', cx, cy,
    'Z'
  ].join(' ')
}

const WheelBackground = {
  props: {
    count: Number,
    pathColor: {
      type: Array,
      default: () => ['none', 'none']
    }
  },
  render() {
    let pathDrawn = []
    let count = this.count
    let angleDiff = 360 / count

    while (count-- > 0) {
      const sectorOption = {
        cx: 5000,
        cy: 5000,
        radius: 5000,
        startAngle: (this.count - (count + 1)) * angleDiff,
        endAngle: (this.count - count) * angleDiff
      }

      pathDrawn.push(getPathDrawn(sectorOption))
    }

    return (
      <svg viewBox="0 0 10000 10000">
        {
          pathDrawn.map((drawn, i) => {
            return <path key={i} d={drawn} fill={this.pathColor[(i + 1) % 2]} />
          })
        }
      </svg>
    )
  }
}

const PrizeItem = {
  functional: true,
  props: ['name', 'image'],
  render(h, context) {
    return (
      <div class="prize" style={context.data.style}>
        <div class="name">{context.props.name}</div>
        <img class="img" src={context.props.image} alt="product-image" />
      </div>
    )
  }
}

const Wheel = {
  components: {
    WheelBackground,
    PrizeItem
  },
  props: {
    buttonImage: String,
    backgroundImage: String,
    prizes: {
      type: Array,
      default: () => [{
        name: '',
        image: {
          src: ''
        },
        id: ''
      }, {
        name: '',
        image: {
          src: ''
        },
        id: ''
      }]
    }
  },
  data() {
    return {
      rotate: false,
      rotateAngle: 0
    }
  },
  computed: {
    prizesAfterCalc() {
      let prizes = this.prizes
      let length = prizes.length

      if (length % 2 === 1) {
        length += 1
        prizes = [...prizes, getVirtualPrize()]
      } else {
        prizes = [...prizes]
        prizes.splice((length >> 1) - 1, 1, prizes[(length >> 1) - 1], getVirtualPrize())
        prizes = [...prizes, getVirtualPrize()]
        length += 2
      }
      return prizes
    }
  },
  methods: {
    handleClickWheelButton() {
      this.$emit('clickWheelButton')
    },
    /**
     * 大转盘开始旋转
     * @param {string} id 奖品 id, 不传 为谢谢参与
     * @return {promise} 6s 后 resolve
     */
    handleStartRotate({ id = getVirtualPrize()['id'] } = {}) {
      return new Promise((resolve, reject) => {
        let index
        this.prizesAfterCalc.some((itm, idx) => {
          if (itm.id === id) {
            index = idx
            return true
          }
        })

        // 目标奖品与 0 度角的角度
        const AngleZeroToTarget = 360 - 360 / this.prizesAfterCalc.length * (index + 0.5)
        // 上次偏移的角度
        const lastAngle = this.rotateAngle % 360
        // 这次旋转的角度 = 上次角度 + 固定旋转角度 + 奖品角度 - 上次偏移角度
        this.rotateAngle = this.rotateAngle + BASE_ROTATE_ANGLE + AngleZeroToTarget - lastAngle

        this.timer = setTimeout(() => {
          resolve()
        }, ROTATE_TIME)
      })
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer)
    this.timer = null
  },
  render() {
    let length = this.prizesAfterCalc.length

    const rotateDiff = 360 / length
    const corrected = rotateDiff >> 1
    const scale = 1 + (MAX_SPLIT_NUMS - length) * 0.1
    const translateY = (MAX_SPLIT_NUMS - length) * 10
    const className = {
      'wheel-content': true
    }
    return (
      <div class="wheel-wrapper">
        <div class={className} style={`background-image:url(${this.backgroundImage});transition: all ${ROTATE_TIME * 0.001}s ease;transform: rotate(${this.rotateAngle}deg);`}>
          <wheel-background pathColor={['#fff', 'none']} count={length} />
          {
            this.prizesAfterCalc.map((prize, i) => {
              const style = [
                `transform:rotate(${i * rotateDiff + corrected}deg)`,
                `scale(${scale})`,
                `translateY(${translateY}px)`
              ].join(' ')

              return <prize-item name={prize.name} image={prize.image.src} key={i} style={style} />
            })
          }
        </div>
        <div onClick={this.handleClickWheelButton} class="wheel-button" style={`background-image:url(${this.buttonImage})`} />
      </div>

    )
  }
}

export default Wheel