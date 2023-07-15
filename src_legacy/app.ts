import { App } from './blah'
import Game from './game'
import Input from './input'

export const app = (element: HTMLElement) => {
  let game = new Game()

  App.run({
    name: 'stacksize23',
    width: 1920,
    height: 1080,
    on_startup() {
    },
    on_update() {
    },
    on_render() {
    }
  })

  if (App.canvas) {
    element.appendChild(App.canvas)
  }

  Input.listen(element)
}
