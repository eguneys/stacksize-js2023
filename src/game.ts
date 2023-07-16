//import { TextureFilter, TextureSampler } from './blah'
import { Color } from './blah'
import { Rect, Vec2 } from './blah'

import { Time, App, batch, Batch, Target } from './blah'

import { bg1, link_color, Play, PlayType} from './play'
import Content from './content'

import { Anim } from './anim'



type RectData = {
  w: number,
  h: number,
  color?: Color
}

export class RectView extends Play {

  get data() {
    return this._data as RectData
  }

  _color!: Color
  set color(c: Color) {
    this._color = c
  }
  get color() {
    return this._color
  }

  set height(h: number) {
    this.data.h = h
  }

  _init() {
    this.color = this.data.color ?? Color.white
  }

  _draw(batch: Batch) {
    batch.rect(Rect.make(this.position.x, this.position.y, this.data.w, this.data.h), this.color)
  }
}

class StackSizePlay extends Play {
  _init() {

    this.make(RectView, Vec2.zero, { w: 1920, h: 1080, color: Color.hex(0xb4beb4)})


    let a = this.make(Anim, Vec2.make(1800, 1000), {
      name: 'rank'
    })
    a.origin = Vec2.make(32, 32)
    a.play_now('3')
    a.rotation = Math.PI / 2

  }
}

class SceneTransition extends Play {

  target!: Target

  current!: Play

  _init() {

    this.current = this._make(StackSizePlay, Vec2.zero, {})

    this.target = Target.create(Game.width, Game.height)

  }

  _draw(batch: Batch) {
    this.current.draw(batch)
    batch.render(this.target)
    batch.clear()


    batch.tex(this.target.texture(0))
    batch.render(App.backbuffer)
    batch.clear()
  }


}


let scene_transition: SceneTransition

export class Game extends Play {

  static width = 1920
  static height = 1080

  //static v_screen = Vec2.make(Game.width, Game.height)

  _init() {

    //batch.default_sampler = TextureSampler.make(TextureFilter.Linear)

    this.objects = []

    /*
    Sound.load().then(() => {
      console.log(Sound)
    })
   */

    Content.load().then(() => {
      //Trans.language = GeneralStore.language
      scene_transition = this.make(SceneTransition, Vec2.zero, {})
    })
  }

  _update() {
  }

  _draw() {

    Play.next_render_order = 0
    App.backbuffer.clear(Color.black)

    this._draw_children(batch)
    //Input._sort_hooks()
  }

}
