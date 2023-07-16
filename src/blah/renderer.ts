import { App } from './app'
import { Color } from './color'
import { Target, Texture } from './graphics'

type Canvas = HTMLCanvasElement

class Canvas_Target extends Target {

  m_canvas!: Canvas

  m_attachments!: Array<Texture>

  m_width: number
  m_height: number

  m_ctx!: CanvasRenderingContext2D

  get ctx() {
    return this.m_ctx
  }

  get textures() { return this.m_attachments }

  clear(color: Color) {
    App.renderer.clear_backbuffer(color, this.m_canvas)
  }

  constructor(width: number, height: number) {
    super()

    this.m_attachments = []
    this.m_canvas = App.renderer.create_canvas()

    this.m_width = width
    this.m_height = height

    //let tex = Texture.create(width, height)
    //this.m_attachments.push(tex)

    this.m_ctx = this.m_canvas.getContext('2d')!
  }

}

class Canvas_Texture extends Texture {
  m_width: number
  m_height: number

  get width() { return this.m_width }
  get height() { return this.m_height }

  m_data!: HTMLImageElement

  set_data(data: HTMLImageElement) {
    this.m_data = data
  }

  get image() {
    return this.m_data
  }

  constructor(width: number, height: number) {
    super()

    this.m_width = width
    this.m_height = height
  }


}

export class Renderer {

  static try_make_renderer = () => {
    return new Renderer()
  }

  get get_draw_size() { return undefined }

  create_target(width: number, height: number) {
    return new Canvas_Target(width, height)
  }

  create_canvas() {
    let canvas = document.createElement('canvas')

    return canvas
  }

  create_texture(width: number, height: number) {
    return new Canvas_Texture(width, height)
  }

  clear_backbuffer(color: Color, canvas?: Canvas) {
  }

  update() {}


  init() {
  }


  render() {
  }

  before_render() {}
  after_render() {}

}
