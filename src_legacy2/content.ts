import { Frame, Animation, Sprite } from './assets/sprite'
import { Subtexture, Vec2, Rectangle as Rect } from './vec2'

import content_page0 from '../content/out_0.png'
import content_page0_json from '../content/out_0.json'

function load_image(path: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    let res = new Image()
    res.onload = () => resolve(res)
    res.src = path
  })
}


class Content {

  image!: HTMLImageElement

  load = async () => {

    let [image] = await Promise.all([
       load_image(content_page0)
     ])

    //let texture = Texture.from_image(image)
    let texture = image

    this.image = image
    this.sprites = []

    content_page0_json.sprites.forEach(_sprite => {
      let { name, packs, tags } = _sprite

      let origin = Vec2.zero

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
