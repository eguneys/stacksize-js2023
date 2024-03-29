//import { TextureFilter, TextureSampler } from './blah'
import { Color } from './blah'
import { Rect, Vec2, Mat3x2 } from './blah'
import { Time, App, batch, Batch, Target } from './blah'

import Content from './content'
import Input, { Hooks, EventPosition, DragEvent } from './input'

import { Tween } from './tween'
import { appr } from './lerp'


export const bg1 = Color.hex(0x202431)
export const link_color = Color.hex(0x4ab2cd)



export abstract class Play {

  static next_render_order: number = 0

  _render_order: number = 0

  visible: boolean = true
  position!: Vec2
  rotation!: number
  origin: Vec2 = Vec2.zero
  scale: Vec2 = Vec2.one

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

  unbindable_input(hooks: Hooks, priority: number = 0) {
    let self = this
    this._disposes.push(Input.register({
      get priority() {
        return self.input_priority
      },
      ...hooks
    }))
  }

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

  _flash_timer: number = 0
  previous_visible: boolean = this.visible

  set visible_(v: boolean) {
    this.visible = v
    this.previous_visible = v
  }

  flash() {
    this.previous_visible = this.visible
    this._flash_timer = 1.7
  }

  update() {

    if (this._flash_timer > 0) {
      this._flash_timer = appr(this._flash_timer, 0, Time.delta)
      if (Time.between_interval(0.2)) {
        this.visible = false
      } else {
        this.visible = true
      }
    } else {
      this.visible = this.previous_visible
    }

    this.objects.forEach(_ => _.update())

    this._tweens = this._tweens.filter(([t, f, on_complete]) => {
      t.update(Time.delta)
      f(t.value)
      if (t.completed && on_complete) {

        on_complete()

      }
      return !t.completed
    })

    this._update()
  }

  draw(batch: Batch) {
    if (this.visible) {
      this._render_order = Play.next_render_order++
      this._draw(batch)
    }
  }

  _draw_children(batch: Batch) {
    this.objects.forEach(_ => _.draw(batch))
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
  _update() {}
  _draw(batch: Batch) {
    batch.push_matrix(Mat3x2.create_transform(this.position, this.origin, this.scale, this.rotation))
    this._draw_children(batch)
    batch.pop_matrix()
  }
  _dispose() {}
}


export type PlayType<T extends Play> = { new(...args: any[]): T}

export type Coroutine = Generator<void>
