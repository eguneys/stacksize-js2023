//import { TextureFilter, TextureSampler } from './blah'
import { Color } from './blah'
import { Rect, Vec2, Mat3x2 } from './blah'

import { Time, App, batch, Batch, Target } from './blah'

import { bg1, link_color, Play, PlayType} from './play'
import Content from './content'

import { Anim } from './anim'
import Input, { EventPosition, DragEvent } from './input'


type ClickableData = {
  abs?: true,
  debug?: true,
  rect: Rect,
  on_hover?: () => boolean,
  on_hover_end?: () => void,
  on_click_begin?: () => boolean,
  on_click?: () => boolean,
  on_drag_begin?: (e: Vec2) => boolean,
  on_drag_end?: (e: Vec2) => void,
  on_drag?: (e: Vec2) => boolean,
  on_drop?: (e: Vec2) => void,
  on_up?: (e: Vec2, right: boolean) => void,
  on_wheel?: (d: number) => void
}

export class Clickable extends Play {

  get data() {
    return this._data as ClickableData
  }

  get width() {
    return this._scaled_rect.w
  }

  get height() {
    return this._scaled_rect.h
  }

  _scaled_rect!: Rect

  get _rect() {
    let { p_position } = this
    return this.data.abs ? 
      Rect.make(p_position.x, p_position.y, this.width, this.height)
      : this._scaled_rect
  }

  get rect() {
    return this._rect
  }

  _init() {

    this._scaled_rect = this.data.rect
    let _dragging = false
    let _hovering = false
    let self = this
    this.unbindable_input({
      on_click_begin(_e: EventPosition, right: boolean) {
        if (right) {
          return false
        }
        if (!self.p_visible) {
          return false
        }
        let e = _e.mul(Game.v_screen)
        let point = Rect.make(e.x, e.y, 1, 1)
        let rect = self.rect
        if (rect.overlaps(point)) {
          return self.data.on_click_begin?.() ?? false
        }
        return false
      },
      on_drag(d: DragEvent, d0?: DragEvent) {
        if (d._right) {
          return false
        }
        if (!self.p_visible) {
          return false
        }
        if (_dragging) {
          let m = d.m!.mul(Game.v_screen)
          return self.data.on_drag?.(m) ?? false
        }

        if (d.m && (!d0 || !d0.m)) {
          let e = d.e.mul(Game.v_screen)
          let point = Rect.make(e.x, e.y, 1, 1)
          let rect = self.rect
          if (rect.overlaps(point)) {
            _dragging = true
            return self.data.on_drag_begin?.(e) ?? false
          } else {
            return false
          }
        }
        return false
      },
      on_up(e: Vec2, right: boolean, m?: Vec2) {
        if (right) {
          return false
        }
        if (!self.p_visible) {
          return false
        }
        let _e = e.mul(Game.v_screen)

        if (_dragging) {
          _dragging = false
          self.data.on_drag_end?.(_e)
        } 

        self.data.on_up?.(e, right)

        if (m) {

          let _m = m.mul(Game.v_screen)
          let point = Rect.make(_m.x, _m.y, 1, 1)
          let rect = self.rect
          if (rect.overlaps(point)) {
            self.data.on_drop?.(m)
          }
        }


        return false
      },
      on_hover(_e: EventPosition) {
        if (!self.data.on_hover) {
          return false
        }
        if (!self.p_visible) {
          return false
        }
        let e = _e.mul(Game.v_screen)
        let point = Rect.make(e.x, e.y, 1, 1)
        let rect = self.rect
        if (rect.overlaps(point)) {
          if (!_hovering) {
            _hovering = true
            return self.data.on_hover?.() ?? false
          }
        } else {
          if (_hovering) {
            _hovering = false
            self.data.on_hover_end?.()
          }
        }
        return _hovering
      },
      on_hover_clear() {
        if (!self.data.on_hover_end) {
          return false
        }
        if (_hovering) {
          _hovering = false
          return self.data.on_hover_end?.()
        }
        if (!self.p_visible) {
          return false
        }
        return false
      },
      on_click(_e: EventPosition, right: boolean) {
        if (!self.p_visible) {
          return false
        }
        let e = _e.mul(Game.v_screen)
        let point = Rect.make(e.x, e.y, 1, 1)
        let rect = self.rect
        if (rect.overlaps(point)) {
          return self.data.on_click?.() ?? false
        }
        return false
      },
    })
  }

  _draw() {
    batch.push_matrix(Mat3x2.create_translation(this.position))
    //this.g_position = Vec2.transform(Vec2.zero, batch.m_matrix)
    this._scaled_rect = Rect.transform(this.data.rect, batch.m_matrix)
    if (this.data.debug) {
      batch.rect(Rect.make(0, 0, this.width, this.height), Color.hex(0x00ff00))
    }
    batch.pop_matrix()
  }

}



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

let chips = [5, 4, 3, 2, 1]
function separateIntoChips(value: number) {
  const result = []

  for (const chip of chips) {
    const count = Math.sign(Math.floor(value / chip))
    result.push(count)
    value -= count * chip
  }
  return result
}

type ChipData = {
  value: number
}

class Chip extends Play {

  get data() {
    return this._data as ChipData
  }

  _init() {

    let chip = this.make(Anim, Vec2.zero, {
      name: 'chip'
    })
    chip.play_now(`f${this.data.value}`)


    let self = this
    this.make(Clickable, Vec2.zero, {
      rect: Rect.make(0, 0, 28, 4),
      on_hover() {
        chip.play_now(`o${self.data.value}`)
        return true
      },
      on_hover_end() {
        chip.play_now(`f${self.data.value}`)
        return true
      }

    })
  }
}

class Chips extends Play {

  chips!: Chip[]

  _init() {
    this.chips = []
  }


  spawn(nb: number) {
    this.chips.forEach(_ => _.dispose())
    this.chips = []

    separateIntoChips(nb).forEach((a, i) => {
      if (a > 0) {
        let chip = this.make(Chip, Vec2.zero, {
          value: chips[i]
        })
        this.chips.push(chip)
      }
    })

    this.chips.forEach((c, i) => {
      c.position.y -= i * 6
    })
  }

}

class Avatar extends Play {
  _init() {

    this.make(Anim, Vec2.zero, {
      name: 'avatar_bg'
    })
  }
}

type LettersData = {
  text: string
}

class Letters extends Play {

  get data() {
    return this._data as LettersData
  }

  _init() {
    let x = 0
    this.data.text.split('').forEach(_ => {
      let l = this.make(Anim, Vec2.make(4 + x, 4), {
        name: 'font'
      })
      l.play_now(_)
      x+= 6
    })
  }
}

class Tips extends Play {

  bg!: RectView
  letters!: Letters[]

  _init() {
    this.letters = []
  }


  say(text: string) {

    this.bg?.dispose()
    this.letters.forEach(_ => _.dispose())

    let rows = text.split('\n')

    this.bg = this.make(RectView, Vec2.zero, { w: 80, h: 20, color: Color.hex(0xd6ffff)})

    this.letters = rows.map((text, row) =>
      this.make(Letters, Vec2.make(2, 2 + row * 6), {
        text
      })
    )
  }
}

class Help extends Play {

  page1!: HelpPage1
  page2!: HelpPage2

  _init() {

    let self = this

    this.make(Clickable, Vec2.zero, {
      rect: Rect.make(0, 0, 320, 180),
      on_click() {
        self.visible_ = false
      }
    })



    this.page1 = this.make(HelpPage1, Vec2.zero, {
      on_next() {
        self.page1.visible_ = false
        self.page2.visible_ = true
      }
    })

    this.page2 = this.make(HelpPage2, Vec2.zero, {
      on_next() {
        self.page2.visible_ = false
        self.page1.visible_ = true
      }
    })
    this.page2.visible_ = false

    this.make(ClickHiButton, Vec2.make(20 + 70, 148), {
      w: 200,
      h: 8,
      text: 'click anywhere else to close this.',
      on_click() {
        self.visible_ = false
      }
    })


  }
}

type ClickHiButtonData = {
  text: string,
  w: number,
  h: number,
  on_click: () => void
}

class ClickHiButton extends Play {

  get data() {
    return this._data as ClickHiButtonData
  }

  _init() {

    let { w, h, text, on_click } = this.data

    let bg_click_here = this.make(RectView, Vec2.make(0, 0), {
      w, h,
      color: Color.hex(0xffffff)
    })
    bg_click_here.visible_ = false

    let self = this
    this.make(Clickable, Vec2.make(0, 0), {
      rect: Rect.make(0, 0, w, h),
      on_hover() {
        bg_click_here.visible_ = true
        return true
      },
      on_hover_end() {
        bg_click_here.visible_ = false
        return true
      },
      on_click() {
        on_click()
        return true
      }
    })

    this.make(Letters, Vec2.make(2, 2), {
      text
    })

  }
}

type HelpPageData = {
  on_next: () => void
}

class HelpPage2 extends Play {
  get data() {
    return this._data as HelpPageData
  }

  _init() {

    this.make(RectView, Vec2.make(20, 20), { w: 280, h: 140, color: Color.hex(0x606461)})

    this.make(Letters, Vec2.make(22 + 60, 22), {
      text: 'stack size holdem poker'
    })


    let self = this
    this.make(ClickHiButton, Vec2.make(22, 134), {
      w: 232,
      h: 8,
      text: 'click here to go back.',
      on_click() {
        self.data.on_next()
      }
    })
  }

}

class HelpPage1 extends Play {
  get data() {
    return this._data as HelpPageData
  }

  _init() {

    this.make(RectView, Vec2.make(20, 20), { w: 280, h: 140, color: Color.hex(0x606461)})

    this.make(Letters, Vec2.make(22 + 60, 22), {
      text: 'stack size holdem poker'
    })


    this.make(Letters, Vec2.make(22, 42), {
      text: 'first you are dealt 2 cards,and blinds posted.'
    })

    this.make(Letters, Vec2.make(22, 52), {
      text: 'you make bets on your turn or call or fold.'
    })

    this.make(Letters, Vec2.make(22, 62), {
      text: 'if you fold opponent wins the pot.if you'
    })

    this.make(Letters, Vec2.make(22, 72), {
      text: 'call,2 cards opens in the middle, time to bet.'
    })

    this.make(Letters, Vec2.make(22, 82), {
      text: 'if you raise, opponent must match your bet.'
    })

    this.make(Letters, Vec2.make(22, 92), {
      text: 'then, 3rd card is revealed,final bets placed.'
    })

    this.make(Letters, Vec2.make(22, 102), {
      text: 'finally, if noone folds, hands are revealed.'
    })

    this.make(Letters, Vec2.make(22 + 50, 122), {
      text: 'strongest hand wins the pot.'
    })


    let self = this
    this.make(ClickHiButton, Vec2.make(22, 136), {
      w: 233,
      h: 8,
      text: 'click here to see how hands are ranked.',
      on_click() {
        self.data.on_next()
      }
    })

  }
}

class StackSizePlay extends Play {

  me_cards!: [Card, Card]
  op_cards!: [Card, Card]

  me_chips!: Chips
  op_chips!: Chips
  me_bets!: Chips
  op_bets!: Chips

  op_avatar!: Avatar
  me_avatar!: Avatar

  me_say!: Tips
  op_say!: Tips

  help!: Help

  _init() {

    this.make(RectView, Vec2.zero, { w: 320, h: 180, color: Color.hex(0x4ab2cd)})

    this.me_cards = [
      this.make(Card, Vec2.make(30, 154), {}),
      this.make(Card, Vec2.make(64, 154), {})
    ]



    this.op_cards = [
      this.make(Card, Vec2.make(256, 24), {}),
      this.make(Card, Vec2.make(290, 24), {})
    ]



    this.me_chips = this.make(Chips, Vec2.make(120, 156), {})
    this.op_chips = this.make(Chips, Vec2.make(120, 36), {})
    //this.me_bets = this.make(Chips, Vec2.make(160, 86), {})
    //this.op_bets = this.make(Chips, Vec2.make(240, 86), {})

    this.me_avatar = this.make(Avatar, Vec2.make(160, 146), {})
    this.op_avatar = this.make(Avatar, Vec2.make(160, 10), {})


    this.deal([cards[0], cards[1]])

    this.me_chips.spawn(15)
    this.op_chips.spawn(15)

    this.me_say = this.make(Tips, Vec2.make(220, 120), {})

    this.op_say = this.make(Tips, Vec2.make(220, 30), {})

    this.help = this.make(Help, Vec2.zero, {})


    let self = this
    this.make(ClickHiButton, Vec2.zero, {

      w: 40,
      h: 8,
      text: 'help',
      on_click() {
        self.help.visible_ = !self.help.visible
      }
    })
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

  static v_screen = Vec2.make(Game.width, Game.height)

  _init() {

    this.position = Vec2.zero

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
    Input._sort_hooks()
  }

}
