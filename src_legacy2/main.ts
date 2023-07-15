import { w, h, colors } from './shared'
import { Vec2 } from './vec2'
import Play from './play'
import { Pointer, bind_pointer } from './pointer'
import { Canvas, Graphics, Batcher } from './webgl'
import Content from './content'
import { Anim } from './anim'

function load_image(path: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    let res = new Image()
    res.onload = () => resolve(res)
    res.src = path
  })
}

function loop(fn: (dt: number, dt0: number) => void) {
  let animation_frame_id: number
  let fixed_dt = 1000/60
  let timestamp0: number | undefined,
  min_dt = fixed_dt * 0.2,
    max_dt = fixed_dt * 2,
    dt0 = fixed_dt

  let elapsed = 0

  function step(timestamp: number) {
    let dt = timestamp0 ? timestamp - timestamp0 : fixed_dt

    dt = Math.min(max_dt, Math.max(min_dt, dt))

    fn(dt, dt0)

    dt0 = dt
    timestamp0 = timestamp
    animation_frame_id = requestAnimationFrame(step)
  }
  animation_frame_id = requestAnimationFrame(step)

  return () => {
    cancelAnimationFrame(animation_frame_id)
  }
}

function make_bounds($element: HTMLElement) {

  let _bounds: ClientRect
  function set_bounds() {
    _bounds = $element.getBoundingClientRect()
  }
  set_bounds()

  document.addEventListener('scroll', () => set_bounds(), { capture: true, passive: true })
  window.addEventListener('resize', () => set_bounds(), { passive: true })


  return {
    get bounds() {
      return _bounds
    }
  }
}

const make_norm_mouse = (has_bounds: any) => {
  return (v: any) => {
    let { bounds } = has_bounds
    return Vec2.make(v[0] / bounds.width * w, v[1] / bounds.height * h)
  }
}

function app(element: HTMLElement) {
  Content.load().then(_ => {
    start(element, Content.image)
  })
}


app(document.getElementById('app')!)


function start(element: HTMLElement, image: HTMLImageElement) {

  let canvas = new Canvas(element, w, h)
  let graphics = new Graphics(canvas)
  let g = new Batcher(graphics)

  let m = new Pointer().init(bind_pointer(canvas.$canvas))
  let _ctx = {
    g,
    m
  }

  let p = Play(_ctx)

  g.init(colors.bg, image)
  let t = 0

  loop((dt: number, dt0: number) => {

    m.update(dt, dt0)
    p.update(dt)


    let n = 1980
    let x = 600
    t += dt

    p.draw()

    g.render()
  })
}
