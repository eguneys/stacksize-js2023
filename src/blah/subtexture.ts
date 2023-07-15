import { Vec2, Rect } from './spatial'

type Texture = any

export class Subtexture {

  static make = (texture: Texture, 
                 source: Rect = Rect.make(0, 0, texture.width, texture.height), 
                 frame: Rect = Rect.make(0, 0, source.w, source.h)) => 
  new Subtexture(texture, source, frame)

  get width() { return this.frame.w }
  get height() { return this.frame.h }

  draw_coords: [Vec2, Vec2, Vec2, Vec2]
  tex_coords: [Vec2, Vec2, Vec2, Vec2]

  constructor(readonly texture: Texture,
              readonly source: Rect,
              readonly frame: Rect) {
                this.draw_coords = [Vec2.zero, Vec2.zero, Vec2.zero, Vec2.zero]
                this.tex_coords = [Vec2.zero, Vec2.zero, Vec2.zero, Vec2.zero]

                this.update()
              }

  update() {

    let { draw_coords, tex_coords, texture, frame, source } = this

    draw_coords[0].x = -frame.x
    draw_coords[0].y = -frame.y
    draw_coords[1].x = -frame.x + source.w
    draw_coords[1].y = -frame.y
    draw_coords[2].x = -frame.x + source.w
    draw_coords[2].y = -frame.y + source.h
    draw_coords[3].x = -frame.x
    draw_coords[3].y = -frame.y + source.h


    if (texture) {
      let uvx = 1 / texture.width
      let uvy = 1 / texture.height

      tex_coords[0].x = source.x * uvx
      tex_coords[0].y = source.y * uvy
      tex_coords[1].x = (source.x + source.w) * uvx
      tex_coords[1].y = source.y * uvy
      tex_coords[2].x = (source.x + source.w) * uvx
      tex_coords[2].y = (source.y + source.h) * uvy
      tex_coords[3].x = source.x * uvx
      tex_coords[3].y = (source.y + source.h) * uvy
    }
  }
}
