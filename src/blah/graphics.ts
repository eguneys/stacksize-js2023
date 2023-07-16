import { App } from './app'
import { Color } from './color'

export abstract class Texture {

  static from_image = (image: HTMLImageElement) => {
    return Texture.create(image.width, image.height, image)
  }


  static create = (width: number, height: number, data: HTMLImageElement) => {
    let res = App.renderer.create_texture(width, height)
    res.set_data(data)
    return res
  }

  abstract image: HTMLImageElement
  abstract width: number
  abstract height: number
  abstract set_data(data: HTMLImageElement): void
}

export type Attachments = Array<Texture>

export abstract class Target {

  static create = (width: number, height: number) => {
    return App.renderer.create_target(width, height)
  }

  get width() {
    return this.textures[0].width
  }

  get height() {
    return this.textures[0].height
  }

  texture(index: number) {
    return this.textures[index]
  }

  abstract textures: Texture[]


  abstract ctx: CanvasRenderingContext2D

  clear(color: Color) {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.width, this.height)
  }
}
