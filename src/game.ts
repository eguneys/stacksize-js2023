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

const ranks = '2tjka'.split('')
const suits = 'rb'.split('')

const cards = ranks.flatMap(rank => suits.map(suit => rank + suit))

type OCard = string

class Card extends Play {

  bg!: Anim
  r!: Anim


  _init() {
    this.bg = this.make(Anim, Vec2.zero, {
      name: 'card_bg'
    })
    this.bg.origin = Vec2.make(16, 20)
    this.bg.visible = false
    
    this.r = this.make(Anim, Vec2.zero, {
      name: 'rank'
    })
    this.r.origin = Vec2.make(12, 16)
    this.r.visible = false

  }

  spawn(card?: OCard) {
    this.bg.visible = true
    this.bg.play_now('spawn', () => {
      if (card) {
        this.bg.play_now('idle')
        this.r.play_now(card)
        this.r.visible = true
      } else {
        this.bg.play_now('back')
      }
      this.flash()
    })

  }
}

class Chips extends Play {

  one!: Anim

  _init() {
    this.one = this.make(Anim, Vec2.zero, {
      name: 'chips'
    })
    this.one.origin = Vec2.make(15, 15)
    this.one.play_now('6')
    this.one.visible = false
  }


  spawn(chips: number) {
    this.one.visible = true
    this.one.play_now(`${chips}`)
    this.one.flash()
  }

}

class StackSizePlay extends Play {

  me_cards!: [Card, Card]
  op_cards!: [Card, Card]

  me_chips!: Chips
  op_chips!: Chips
  me_bets!: Chips
  op_bets!: Chips

  _init() {

    this.make(RectView, Vec2.zero, { w: 320, h: 180, color: Color.hex(0x101088)})

    this.me_cards = [
      this.make(Card, Vec2.make(30, 154), {}),
      this.make(Card, Vec2.make(64, 154), {})
    ]



    this.op_cards = [
      this.make(Card, Vec2.make(256, 24), {}),
      this.make(Card, Vec2.make(290, 24), {})
    ]



    this.me_chips = this.make(Chips, Vec2.make(200, 156), {})
    this.op_chips = this.make(Chips, Vec2.make(280, 56), {})
    this.me_bets = this.make(Chips, Vec2.make(200, 106), {})
    this.op_bets = this.make(Chips, Vec2.make(280, 106), {})



    this.deal([cards[0], cards[1]])

    this.me_chips.spawn(12)
    this.op_chips.spawn(12)
  }


  deal(card: [OCard, OCard]) {
    this.me_cards[0].spawn(card[0])
    this.me_cards[1].spawn(card[1])

    this.op_cards[0].spawn()
    this.op_cards[1].spawn()
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
