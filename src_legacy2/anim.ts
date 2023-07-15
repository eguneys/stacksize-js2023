import { Rectangle as Rect, Vec2 } from './vec2'
import Content from './content'

import { Play } from './play_base'
import Camera from './camera'

export type AnimData = {
  name: string
}

export class Anim extends Play {

  get data() {
    return this._data as AnimData
  }

  get sprite() {
    return Content.find_sprite(this.data.name)
  }


  alpha: number = 255
  get alpha_color() {
    return this.alpha
    //return new Color(this.alpha, this.alpha, this.alpha, this.alpha)
  }

  _animation: string = 'idle'
  get animation() {
    return this.sprite.get(this._animation)
  }

  _frame_counter: number = 0
  _frame: number = 0

  get frame() {
    return this.animation?.frames[this._frame]

  }

  get subtexture() {
    return this.frame?.image
  }

  get duration() {
    return this.frame?.duration
  }

  _loop: boolean = false
  _reverse: boolean = false
  _on_complete?: () => void
  play_now(name: string, on_complete?: () => void, reverse: boolean = false) {
    this._on_complete = on_complete
    this._animation = name
    this._frame = 0

    if (reverse) {
      let frames_length = this.animation?.frames.length || 0
      this._frame = frames_length - 1
    }
    this._reverse = reverse
  }

  will_play?: () => void
  play(name: string, on_complete?: () => void, reverse: boolean = false) {

    this.will_play = () => this.play_now(name, on_complete, reverse)
  }

  play_o(name: string, options: { loop?: boolean }) {
    this._loop = options.loop ?? false
    this.play_now(name)
  }


  _init() {
  }

  _update(dt: number) {

    const frames_length = this.animation?.frames.length
    const frame_duration = this.frame?.duration

    if (frames_length && frame_duration) {

      this._frame_counter += dt

      if (this._frame_counter >= frame_duration) {
        this._frame_counter -= frame_duration
        if (this._reverse) {
          this._frame--;
          if (this._frame < 0) {
            if (this._loop) {
              this._frame = frames_length - 1
            } else {
              this._frame = 0
            }
            if (this._on_complete) {
              this._on_complete()
            }
            if (this.will_play) {
              this.will_play()
              this.will_play = undefined
            }
          }
        } else {
          this._frame++;
          if (this._frame >= frames_length) {
            if (this._loop) {
              this._frame = 0
            } else {
              this._frame = frames_length - 1
            }
            if (this._on_complete) {
              this._on_complete()
            }
            if (this.will_play) {
              this.will_play()
              this.will_play = undefined
            }
          }
        }
      }
    }
  }

  _draw() {
  }

  _draw_with_camera(camera: Camera) {

    if (!this.subtexture) {
      return
    }


    let { rotation } = this
    let color = 0
    let { x, y } = this.position
    let { x: w, y: h } = this.scale
    
    let sx = this.subtexture.subrect.x
    let sy = this.subtexture.subrect.y
    let sw = this.subtexture.subrect.w
    let sh = this.subtexture.subrect.h


    camera.texture(color, rotation, x, y, w, h, sx, sy, sw, sh)
  }

}
