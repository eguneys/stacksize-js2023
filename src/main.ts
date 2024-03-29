import { App, batch } from './blah'
import { Game } from './game'
import Input from './input'

function app(element: HTMLElement) {

  let game = new Game()


  App.run({
    name: 'stacksize-js2023',
    width: 320,
    height: 180,
    on_startup() {
      game.init()
    },
    on_update() {
      game.update()
    },
    on_render() {
      game.draw(batch)
    }
  })


  if (App.canvas) {
    element.appendChild(App.canvas)
  }

  Input.listen(element)
}


app(document.getElementById('app')!)
