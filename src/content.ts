import { Game } from './game'
import { Rect, Vec2, Image as BImage } from './blah'
import { Texture, Subtexture } from './blah'

import { Frame, Animation, Sprite } from './assets/sprite'

import content_page0 from '../content/out_0.png'
import content_page0_json from '../content/out_0.json'

function load_image(path: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    let res = new Image()
    res.onload = () => resolve(res)
    res.src = path
  })
}


const letters = [
  'abcdefghijklmnop'.split(''),
  'qrstuvwxyz '.split(''),
  '1234567890!$+-.,:'.split('')
]

class Content {

  load = async () => {

    let [image] = await Promise.all([
       load_image(content_page0)
    ])

    let texture = Texture.from_image(image)

    this.sprites = []


    content_page0_json.sprites.forEach(_sprite => {
      let { name, packs, tags } = _sprite

      let origin = Vec2.zero

      if (name === 'font') {

        let animations: Array<Animation> = []


        let _ = packs[0]

        letters.forEach((ls, col) => {
          ls.forEach((letter, row) =>  {

            let frames: Array<Frame> = []
            let framerect = Rect.make(_.frame.x, _.frame.y, _.frame.w, _.frame.h)
            let subrect = Rect.make(_.packed.x + 4 + 6 * row, _.packed.y + 4 + 6 * col, 6, 6)
            let frame = new Frame(Subtexture.make(texture, subrect, framerect), 1000)
            frames.push(frame)


            let anim = new Animation(letter, frames)
            animations.push(anim)
          })
        })

        let sprite = new Sprite(name, origin, animations)

        this.sprites.push(sprite)
        return
      }



      let animations: Array<Animation> = []

      tags.forEach(tag => {
        let frames = []
        for (let i = tag.from; i <= tag.to; i++) {

          let _ = packs[i]
          let duration = _.meta.duration/ 1000
          let framerect = Rect.make(_.frame.x, _.frame.y, _.frame.w, _.frame.h)
          let subrect = Rect.make(_.packed.x, _.packed.y, _.packed.w, _.packed.h)

          let frame = new Frame(Subtexture.make(texture, subrect, framerect), duration)
          frames.push(frame)
        }

          let anim = new Animation(tag.name, frames)

          animations.push(anim)
      })



      let sprite = new Sprite(name, origin, animations)

      this.sprites.push(sprite)


    })
  }


  sprites!: Array<Sprite>

  find_sprite(name: string) {
    return this.sprites.find(_ => _.name === name)!
  }
}


export default new Content()
