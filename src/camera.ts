import { ticks } from './shared'
import { ti, completed, read, update, tween } from './anim'
import { arr_shuffle } from './util'
import { Batcher } from './webgl'

type Tween = any

export default class Camera {

  x: number
  y: number

  _t?: Tween
  _t2?: Tween

  constructor(readonly g: Batcher, readonly r: number) { 
    this.x = 0
    this.y = 0
  }

  shake(arr: Array<number>, arr2: Array<number>, radius: number) {
    this._t = tween([1.2, 0.8, 1.0, ...arr, 0.5, 0.2, 0].map(_ => _ * radius), [ticks.five, ticks.three, ticks.one * 2])
    this._t2 = tween([1.2, 0.8, 1.0, ...arr2, 0.5, 0.2, 0].map(_ => _ * radius), [ticks.five, ticks.three, ticks.one * 2])
  }

  update(dt: number, dt0: number) {
    if (this._t) {
      update(this._t, dt, dt0)
      let [_x] = read(this._t)
      this.x = _x

      if (completed(this._t)) {
        this._t = undefined
      }

    }
    if (this._t2) {
      update(this._t2, dt, dt0)
      let [_x] = read(this._t2)
      this.y = _x
      if (completed(this._t2)) {
        this._t2 = undefined
      }
    }
  }
    
  fr(color: number, _r: number, _x: number, _y: number, _w: number, _h: number, hollow: number, shadow_color = 0x000000) {
    let { r, x, y } = this
    _x += x
    _y += y
    this.g.fr(shadow_color, _r, r * _x + 2 - _x * 0.0025, r * _y + 2 - _y * 0.0025, r * _w, r * _h, hollow)
    this.g.fr(color, _r, r * _x, r * _y, r * _w, r * _h, hollow)
  }

  fc(color: number, _x: number, _y: number, _r: number, hollow: number, shadow_color = 0x000000, rotation = 0) {
    let { r, x, y } = this
    _x += x
    _y += y
    this.g.fc(shadow_color, r * _x + 2 - _x * 0.0025, r * _y + 2 - _y * 0.0025, r * _r, hollow, rotation)
    this.g.fc(color, r * _x, r * _y, r * _r, hollow, rotation)
  }

  line(color: number, a: number, _x: number, _y: number, _r: number, stroke = 10) {
    let { r, x, y } = this

    _x += x
    _y += y
    this.g.line(0xffffff, a, r * _x + 2 - _x * 0.0015, r * _y + 2 - _y * 0.0015, r * _r, stroke * r)
    this.g.line(color, a, r * _x, r * _y, r * _r, stroke * r)
  }


  texture(color: number, _r: number, _x: number, _y: number, w: number, h: number, sx: number, sy: number, sw: number, sh: number) {
    let { r, x, y } = this
    _x += x
    _y += y
    let tw = 320,
      th = 180
    this.g.texture(color, _r, _x * r, _y * r, w, h, sx, sy, sw, sh, tw, th)
  }
}
