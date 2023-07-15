import { TextureFilter, TextureSampler } from './blah'
import { Color } from './blah'
import { Rect, Vec2, Mat3x2 } from './blah'

import { Time, App, batch, Batch, Target } from './blah'

import { bg1, link_color, Play, PlayType} from './play'
import Content from './content'

export class Game extends Play {

  static width = 1920
  static height = 1080

  static v_screen = Vec2.make(Game.width, Game.height)

  _init() {

    batch.default_sampler = TextureSampler.make(TextureFilter.Linear)

    this.objects = []

    /*
    Sound.load().then(() => {
      console.log(Sound)
    })
   */

    Content.load().then(() => {
      //Trans.language = GeneralStore.language
      //scene_transition = this.make(SceneTransition, Vec2.zero, {})
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
