import { Tween } from './tween'
import { Vec2 } from './vec2'

export abstract class Play {

  static next_render_order: number = 0

  _render_order: number = 0

  visible: boolean = true
  position!: Vec2
  rotation!: number
  origin: Vec2 = Vec2.zero
  scale: Vec2 = Vec2.unit


  coroutines: Array<Coroutine> = []

  routine(coroutine: Coroutine) {
    this.coroutines.push(coroutine)
  }

  *wait_for(ms: number, dt: number) {
    let n = 0
    while(n < ms) {
      n+= dt
      yield
    }
  }


  get input_priority() {
    return this._render_order
  }

  _data: any

  _set_data(position: Vec2, data: any): this { 
    this.position = position
    this.rotation = 0
    this._data = data 
    return this
  }

  /*
  unbindable_input(hooks: Hooks, priority: number = 0) {
    let self = this
    this._disposes.push(Input.register({
      get priority() {
        return self.input_priority
      },
      ...hooks
    }))
  }
 */

  _disposes!: Array<() => void>
  objects!: Array<Play>
  parent?: Play

  get p_position(): Vec2 {
    if (this.parent) {
      return this.parent.p_position.add(this.position)
    }
    return this.position
  }

  get p_visible(): boolean {
    if (this.parent) {
      return this.parent.p_visible && this.visible
    }
    return this.visible
  }


  send_front() {
    if (this.parent) {
      this.parent.objects.splice(this.parent.objects.indexOf(this), 1)
      this.parent.objects.push(this)
    }
  }

  send_back() {
    if (this.parent) {
      this.parent.objects.splice(this.parent.objects.indexOf(this), 1)
      this.parent.objects.unshift(this)
    }
  }

  _add_object(child: Play) {
    this.objects.push(child)
    child.parent = this
  }

  _make<T extends Play>(ctor: { new(...args: any[]): T}, position: Vec2, data: any) {
    let res = new ctor()._set_data(position, data).init()
    return res
  }

  _tweens: Array<[Tween, (v: number) => void, (() => void) | undefined]> = []
  tween(values: Array<number>, f: (v: number) => void, duration: Array<number> | number, loop: number = 0, on_complete?: () => void) {

    duration = typeof duration === 'number' ? [duration] : duration
    let t = new Tween(values, duration, loop).init()
    this._tweens.push([t, f, on_complete])
    return t
  }

  cancel(t: Tween) {
    this._tweens = this._tweens.filter(_ => _[0] !== t)
  }

  _tween?: Tween
  tween_single(_ref: Tween | undefined, values: Array<number>, f: (v: number) => void, duration: Array<number> | number, loop: number = 0, on_complete?: () => void) {
    if (_ref) {
      this.cancel(_ref)
    }
    return this.tween(values, f, duration, loop, on_complete)
  }



  make<T extends Play>(ctor: { new(...args: any[]): T}, position: Vec2, data: any) {
    let res = this._make(ctor, position, data)
    this._add_object(res)
    return res
  }

  init(): this { 

    this._disposes = []
    this.objects = []

    this._init()
    return this 
  }

  update(dt: number) {

    this.coroutines = this.coroutines.filter(_ => {
      let res = _.next()
      return !res.done
    })

    this.objects.forEach(_ => _.update(dt))

    this._tweens = this._tweens.filter(([t, f, on_complete]) => {
      t.update(dt)
      f(t.value)
      if (t.completed && on_complete) {

        on_complete()

      }
      return !t.completed
    })

    this._update(dt)
  }

  draw() {
    if (this.visible) {
      this._render_order = Play.next_render_order++
      this._draw()
    }
  }

  _draw_children() {
    this.objects.forEach(_ => _.draw())
  }

  dispose() {

    this.objects.slice(0).forEach(_ => _.dispose())
    this._dispose()

    this._disposes.forEach(_ => _())
    if (this.parent) {
      this.parent.objects.splice(this.parent.objects.indexOf(this), 1)
    }
  }

  _init() {}
  _update(dt: number) {}
  _draw() {
    this._draw_children()
  }
  _dispose() {}
}


export type PlayType<T extends Play> = { new(...args: any[]): T}


export type Coroutine = Generator<void>
