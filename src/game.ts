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


class Card extends Play {
  _init() {
    let a = this.make(Anim, Vec2.zero, {
      name: 'card_bg'
    })
    a.origin = Vec2.make(16, 20)
    a.play_now('spawn', () => {
      a.play_now('idle')
    })
  }
}

class StackSizePlay extends Play {
  _init() {

    this.make(RectView, Vec2.zero, { w: 320, h: 180, color: Color.hex(0x101088)})

    this.make(Card, Vec2.make(30, 154), {})
    this.make(Card, Vec2.make(64, 154), {})



    this.make(Card, Vec2.make(256, 24), {})
    this.make(Card, Vec2.make(290, 24), {})

  }
}

class SceneTransition extends Play {

  current!: Play

  _init() {

    this.current = this.make(StackSizePlay, Vec2.zero, {})
  }

  _draw(batch: Batch) {

    this.current.draw(batch)
    batch.render(App.backbuffer)
    batch.clear()
  }


}


let scene_transition: SceneTransition

export class Game extends Play {

  static width = 320
  static height = 180

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

  _update() {}

  _draw() {

    Play.next_render_order = 0
    App.backbuffer.clear(Color.black)

    this._draw_children(batch)
    //Input._sort_hooks()
  }

}
