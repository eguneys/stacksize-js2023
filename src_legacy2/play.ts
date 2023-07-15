import { Play } from './play_base'
import Content from './content'
import { Vec2 } from './vec2'

import { Anim } from './anim'










type Context = any

class Game extends Play {

  get g() {
    return this.context.g
  }

  constructor(public context: Context) {
    super()
  }

  static width = 1920
  static height = 1080

  static v_screen = Vec2.make(Game.width, Game.height)

  _init() {

    this.objects = []

    /*
    Sound.load().then(() => {
      console.log(Sound)
    })
   */

    Content.load().then(() => {
      console.log('loaded')


      this.make(Anim, Vec2.zero, {
        name: 'rank'
      })

    })
  }

  _update() {
  }

  _draw() {

    Play.next_render_order = 0

    this._draw_children()
    //Input._sort_hooks()
  }

}

export default function PlayMake(context: Context) {


  return new Game(context).init()


}
