import { App } from './app'
import { Vec2, Rect, Mat3x2 } from './spatial'
import { Color } from './color'
import { Target, Texture } from './graphics'
import { Subtexture } from './subtexture'

type Quad = [number, number, number, number, number, number, number, number]

class DrawBatch {
  offset: number = 0
  elements: number = 0
  texture?: Texture

  get clone() {
    let res = new DrawBatch()
    res.offset = this.offset
    res.elements = this.elements
    res.texture = this.texture
    return res
  }
}

export class Batch {

  m_batch: DrawBatch = new DrawBatch()
  m_tex_mult = 255
  m_tex_wash = 0

  m_batches: DrawBatch[] = []
  m_batch_insert = 0

  pop_matrix() {
    let { ctx } = App.backbuffer
    ctx.restore()
  }

  push_matrix(matrix: Mat3x2, absolute: boolean = false) {
    let { ctx } = App.backbuffer
    ctx.save()

    let [a, b, c, d, e, f] = [
      matrix.m11, matrix.m12, matrix.m21,
      matrix.m22, matrix.m31, matrix.m32,
      0, 0, 1
    ]
    ctx.transform(a, b, c, d, e, f)
  }


  clear() {
  }

  rect(rect: Rect, color: Color) {
  }

  tex(texture: Texture, pos: Vec2 = Vec2.zero, color: Color = Color.white) {
    this.set_texture(texture)

    let w = texture.width
    let h = texture.height

    let { m_tex_mult, m_tex_wash } = this

    this.PUSH_QUAD(
      pos.x, pos.y, pos.x + w, pos.y, pos.x + w, pos.y + h, pos.x, pos.y + h,
      0, 0, 1, 0, 1, 1, 0, 1,
      color, color, color, color,
      m_tex_mult, m_tex_wash, 0)
  }

  stex(sub: Subtexture, pos: Vec2 = Vec2.zero, color: Color = Color.white) {
    let { m_tex_mult, m_tex_wash } = this

    this.set_texture(sub.texture)
    this.PUSH_QUAD(
      pos.x + sub.draw_coords[0].x, pos.y + sub.draw_coords[0].y,
      pos.x + sub.draw_coords[1].x, pos.y + sub.draw_coords[1].y,
      pos.x + sub.draw_coords[2].x, pos.y + sub.draw_coords[2].y,
      pos.x + sub.draw_coords[3].x, pos.y + sub.draw_coords[3].y,
      sub.tex_coords[0].x, sub.tex_coords[0].y,
      sub.tex_coords[1].x, sub.tex_coords[1].y,
      sub.tex_coords[2].x, sub.tex_coords[2].y,
      sub.tex_coords[3].x, sub.tex_coords[3].y,
      color, color, color, color,
      m_tex_mult, m_tex_wash, 0)
  }

  m_texture!: Texture

  /*
  quads: Quad[] = []
 */

  PUSH_QUAD(px0: number, py0: number,
            px1: number, py1: number,
            px2: number, py2: number,
            px3: number, py3: number,
            tx0: number, ty0: number,
            tx1: number, ty1: number,
            tx2: number, ty2: number,
            tx3: number, ty3: number,
            col0: Color, col1: Color, col2: Color, col3: Color,
            mult: number, wash: number, fill: number) {

              let { ctx } = App.backbuffer
              let [dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight] = [
                px0, py0,
                px1 - px0,
                py2 - py0,
                tx0 * this.m_texture.width, ty0 * this.m_texture.height,
                (tx1 - tx0) * this.m_texture.width,
                (ty2 - ty0) * this.m_texture.height
              ]

              let { image } = this.m_texture

              ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  }

  set_texture(texture: Texture) {
    this.m_texture = texture
  }

  render(target: Target = App.backbuffer) {
  }

}


export const batch = new Batch()
