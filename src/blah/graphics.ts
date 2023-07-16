import { App } from './app'
import { Color } from './color'

export abstract class Texture {

  static from_image = (image: HTMLImageElement) => {
    return Texture.create(image.width, image.height, image)
  }


  static create = (width: number, height: number, data?: HTMLImageElement) => {
    return App.renderer.create_texture(width, height)
  }

  abstract width: number
  abstract height: number
  abstract set_data(data: ImageData | HTMLImageElement): void
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

  abstract clear(color: Color): void
}
