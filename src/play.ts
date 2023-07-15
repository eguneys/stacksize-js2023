import { w, h, colors, ticks } from './shared'
import { ti, completed, read, update, tween } from './anim'
import { Line, Vec2, Rectangle, Circle } from './vec2'
import { 
  Behaviour,
  RigidOptions,
  steer_behaviours, 
  b_no_steer,
  b_wander_steer,
  b_separation_steer,
  b_arrive_steer, 
  b_orbit_steer,
  b_avoid_circle_steer, 
  b_flee_steer } from './rigid'
import { generate, psfx } from './audio'
import Camera from './camera'

import { arr_shuffle } from './util'

const quick_burst = (radius: number, start: number = 0.8, end: number = 0.2) => 
tween([start, start, 1, end].map(_ => _ * radius), [ticks.five + ticks.three, ticks.three * 2, ticks.three * 2])

const rect_orig = (rect: Rectangle, o: Vec2) => {
  return rect.x1 <= o.x && o.x <= rect.x2 && rect.y1 <= o.y && o.y <= rect.y2
}

const circ_orig = (c: Circle, v: Vec2) => {
  return c.o.distance(v) <= c.r
}

type RNG = () => number

/* https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript */
const make_random = (seed = 1) => {
  return () => {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
}
const random = make_random()

let v_screen = Vec2.make(1920, 1080)
let r_screen = Rectangle.make(0, 0, 1920, 1080)

function rnd_angle(rng: RNG = random) {
  return rng() * Math.PI * 2
}

function rnd_vec_h(rng: RNG = random) {
  return Vec2.make(rnd_h(rng), rnd_h(rng))
}

function rnd_vec(mv: Vec2 = Vec2.unit, rng: RNG = random) {
  return Vec2.make(rng(), rng()).mul(mv)
}

function rnd_h(rng: RNG = random) {
  return rng() * 2 - 1
}

function rnd_int_h(max: number, rng: RNG = random) {
  return rnd_h(rng) * max
}

function rnd_int(max: number, rng: RNG = random) {
  return Math.floor(rng() * max)
}

function arr_rnd<A>(arr: Array<A>) {
  return arr[rnd_int(arr.length)]
}

function arr_remove<A>(arr: Array<A>, a: A) {
  arr.splice(arr.indexOf(a), 1)
}



const slow_burst = (radius: number, rng: RNG = random) => 
tween([0.1, 0.1, 0.5, 1].map(_ => _ * radius), arr_shuffle([ticks.five + ticks.three, ticks.three * 2, ticks.five * 2, ticks.five, ticks.three * 2], rng))




const jaggy = (max: number, rng: RNG = random) => {

  let ns = [...Array(1 + rnd_int(max, rng)).keys()].map(_ => rng()).sort()
  let wander_target = 0
  let jitter = 4
  let r = 3 + rng() * max
  let distance = 8
  let envelope = [0, 0.1, 0.3, 0.5, 0.3, 0]
  let rs = ns.map((_, i) => {
    wander_target += rnd_h(rng) * jitter
    let res = wander_target * r + distance
    let _envelope = envelope[Math.floor(i / ns.length * envelope.length)]
    return res * _envelope
  })
  return [ns, rs]
}


const on_interval = (t: number, life: number, life0: number) => {
  return Math.floor(life0 / t) !== Math.floor(life / t)
}

const on_interval_lee = (t: number, life: number, life0: number, lee: Array<number>) => {
  //return lee.some(_ => on_interval(t, life - _, life0 - _) || on_interval(t, life + _, life0 + _))
  return lee.some(_ => (life + _) % t === 0 || (life - _) % t === 0)
}

type Context = any

abstract class Play {

  get g() { return this.ctx.g }
  get m() { return this.ctx.m }

  data: any

  life: number = 0
  life0: number = 0

  constructor(readonly ctx: Context) {}

  _set_data(data: any): this { 
    this.data = data 
    return this
  }

  init(): this { 
    this.life = 0
    this.life0 = 0
    this._init()
    return this 
  }

  update(dt: number, dt0: number) {
    this.life0 = this.life
    this.life += dt
    this._update(dt, dt0)
  }

  draw() {
    this._draw()
  }

  /* https://github.com/eguneys/monocle-engine/blob/master/Monocle/Scene.cs#L122 */
  on_interval(t: number) {
    return on_interval(t, this.life, this.life0)
  }

  /* https://github.com/eguneys/monocle-engine/blob/master/Monocle/Util/Calc.cs#L944 */
  between_interval(i: number) {
    return this.life % (i * 2) > i
  }

  abstract _init(): void;
  abstract _update(dt: number, dt0: number): void;
  abstract _draw(): void;
}

abstract class PlayMakes extends Play {

  objects: PlayMakes[] = []
  makes!: any[]

  make(Ctor: any, data: any = {}, delay: number = 0, repeat: number = 1) {
    this.makes.push([Ctor, data, delay, repeat, 0, 0])
  }


  init() {
    this.makes = []
    return super.init()
  }

  update(dt: number, dt0: number) {
    let { makes } = this
    this.makes = []

    this.makes = this.makes.concat(makes.filter(_ => {

      _[4] += dt

      let [Ctor, f_data, _delay, _s_repeat, _t, _i_repeat] = _

      let _at_once = _s_repeat < 0
      let _repeat = Math.abs(_s_repeat)

      if (_t >= _delay) {
        
        do {
          new Ctor(this)._set_data({
            group: this.objects,
            ...f_data.apply?.(
              _[5],
              _[4],
              _repeat,
              _delay,
            ) || f_data
          }).init()
        } while(++_[5] < _repeat && _at_once)

        _[4] = 0

        if (_repeat === 0 || _[5] < _repeat) {
          return true
        }
      } else {
        return true
      }
    }))

    super.update(dt, dt0)
  }


  _init() {}
  _update(dt: number, dt0: number) {}
  _draw() {}
}

abstract class WithPlays extends PlayMakes {

  on_dispose: any[]

  make(...args: any) {
    this.plays.make.apply(this.plays, args)
  }

  get camera() {
    return this.plays.camera
  }

  shake(radius: number) {
    this.plays.shake(radius)
  }

  constructor(readonly plays: AllPlays) {
    super(plays.ctx)
    this.on_dispose = []
  }

  init() {
    let { group } = this.data

    if (group) {
      group.push(this)
    }
    return super.init()
  }


  dispose(reason?: any) {
    let { group } = this.data
    if (group) {
      arr_remove(group, this)
    }
    this.on_dispose.forEach(_ => _(this, reason))
    this._dispose(reason)
  }


  _dispose(_: string) {}
}

/*
abstract class WithRigidPlays extends WithPlays {

  _bh: any

  readonly v_target = Vec2.unit

  readonly r_opts: RigidOptions = {
    x0: 0,
    mass: 1000,
    air_friction: 0.9,
    max_speed: 100,
    max_force: 3
  };
  readonly r_bs: Array<Behaviour> = [];

  r_wh!: Vec2;

  get angle() {
    return this.side.angle
  }

  get side() {
    return this._bh._body.side
  }

  get vs() {
    return this._bh._body.vs
  }

  get x() {
    return this.vs.x
  }

  get y() {
    return this.vs.y
  }

  get w() {
    return this.r_wh.x
  }

  get h() {
    return this.r_wh.y
  }

  get radius() {
    let { r_wh } = this
    return Math.max(r_wh.x, r_wh.y)
  }

  get rect() {
    let { vs, r_wh } = this
    return Rectangle.make(vs.x, vs.y, r_wh.x, r_wh.y)
  }

  get circle() {
    return Circle.make(this.v_target.x, this.v_target.y, this.radius)
  }

  init() {

    let { v_pos, wh, radius } = this.data
    this.v_target.set_in(v_pos.x, v_pos.y)
    this.r_wh = wh || (radius && Vec2.make(radius, radius)) || this.r_wh
    this._bh = steer_behaviours(this.v_target, this.r_opts, this.r_bs)

    return super.init()
  }


  update(dt: number, dt0: number) {
    this._bh.update(dt, dt0)
    super.update(dt, dt0)
  }
}
*/


let letters = "abcdefghijklmnopqrstuvwxyz!0123456789,.".split('')

class Letters extends WithPlays {


  _update(dt: number) {
    if (this.data.life) {
      if (this.life > this.data.life) {
        this.dispose()
      }
      this.data.v_pos.y -= dt * 0.1
    }
  }

  _draw() {

    let [text, color] = this.data.text ? [this.data.text, colors.white] : this.data._text()
    let _letters: string[] = text.split('')
    let { v_pos, scale } = this.data;
    scale ||= 2
    _letters.forEach((letter, i) => {
      let sx = letters.indexOf(letter) * 8
      if (sx >= 0) {
        this.camera.texture(color, 0, v_pos.x + i * scale * 5*(1920/320), v_pos.y, scale*5, scale*7, sx, 9, 5, 7)
      }
    })
  }
}


class BPM extends WithPlays {

  _t!: number
  _ms_per_sub!: number
  _lookahead_ms!: number
  _sub!: number

  _sub0!: number

  get beat_ms(): [number, number] {
    return [this._sub, this._sub0]
    //return [this._sub, this._t, this._t / this._ms_per_sub]
  }

  _init() {

    let _bpm = this.data.bpm
    let _ms_per_beat = 60000 / _bpm
    let _subs = 4
    let _ms_per_sub = _ms_per_beat / _subs

    let _sub = -1

    let _lookahead_ms = 20
    let _t = _lookahead_ms
    //let m_t = () => _t - _lookahead_ms

    this._t = _t
    this._ms_per_sub = _ms_per_sub
    this._lookahead_ms = _lookahead_ms
    this._sub = _sub

    this._sub0 = this._sub
  }

  _update(dt: number) {
    let { _t, _ms_per_sub, _lookahead_ms } = this

    this._sub0 = this._sub

    if (_t + dt + _lookahead_ms > _ms_per_sub) {
      this._t = _t - _ms_per_sub + dt
      this._sub += 1
    } else {
      this._t += dt
    }
  }
}

/*
class Audio extends WithPlays {

  _beat?: () => void
  _i_beat!: number
  _ready!: boolean

  _init() {
    this._ready = false
    this._beat = undefined
    this._i_beat = 0
  }

  beat(n: number) {
    if (this._i_beat !== n) {
      this._beat?.()
      this._beat = undefined
      this._i_beat = n
    }
  }

  _update() {

    if (!this._ready && this.m.just_lock) {
      generate(() => this._ready = true)
    }
    if (this.m.just_lock) {
      let _ = this.plays.one(Dialog, this.plays.ui)
      if (_) {
        _._dd = true
      }
    }
    if (this._ready && !this._beat && this.m.been_lock !== undefined) {
      console.log('ibeat', this._i_beat)
      this.plays.one(Spawn).playing = this._i_beat !== 1

      this._beat = psfx(this._i_beat, true)
      this.make(BPM, { bpm: 80 } )
    }

    if (this._beat && this.m.just_unlock) {
      this.plays.one(Spawn).playing = false
      this._beat()
      this._beat = undefined
      this.plays.one(BPM)?.dispose()
    }


  }

}
*/

/*
class Spawn extends WithPlays {
}
*/

/*
class Dialog extends WithPlays {
}
*/


let _is = [0, 0.1, -0.2, 0.2, -0.5, -0.3, -0.1, 0.3, 0.5, 0.8, -1, 0]


export default class AllPlays extends PlayMakes {

  ui!: PlayMakes[]
  camera!: Camera


  all(Ctor: any) {
    return this.objects.filter(_ => _ instanceof Ctor)
  }

  one(Ctor: any, o: PlayMakes[] = this.objects) {
    return o.findLast((_: PlayMakes) => _ instanceof Ctor) as typeof Ctor
  }

  _shake = 0

  shake(radius: number) {
    this._shake = this._shake * 0.6 + radius
  }

  get beat_ms(): [number, number] | undefined {
    return this.one(BPM)?.beat_ms
  }

  on_beat_lee(sub: number, lee: Array<number> = [0, 1, 2]) {
    return this.beat_ms !== undefined && on_interval_lee(sub, ...this.beat_ms, lee)
  }

  on_beat(sub: number) {
    return this.beat_ms !== undefined && on_interval(sub, ...this.beat_ms)
  }

  _init() {

    this.camera = new Camera(this.g, w/1920)

    this.objects = []
    this.ui = []

    //this.make(Audio)
    //this.make(Background)

    //this.make(Spawn)

    
    this.make(Letters, {
      text: 'die in',
      v_pos: Vec2.make(100, 100)
    })

   // this.make(Area, { x: v_screen.half.x, y: v_screen.half.y, color: colors.gray, radius: 1000 }, ticks.seconds * 8, 0)
    
  }

  _update(dt: number, dt0: number) {

    if (this.on_beat_lee(4, [0, 1])) {
      if (this._shake > 0) {
        this.camera.shake(arr_shuffle(_is, random), arr_shuffle(_is, random), this._shake)
        this._shake = 0
      }
    }

    this.camera.update(dt, dt0)

    this.objects.forEach(_ => _.update(dt, dt0))
    this.ui.forEach(_ => _.update(dt, dt0))
  }
  _draw() {
    this.objects.forEach(_ => _.draw())
    this.ui.forEach(_ => _.draw())
  }
}
