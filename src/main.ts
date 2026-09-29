import '@fontsource/barlow-condensed/400.css'
import '@fontsource/barlow-condensed/900.css'
import './styles.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const body = document.body
const header = document.querySelector<HTMLElement>('[data-header]')
const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle')
const nav = document.querySelector<HTMLElement>('#site-nav')
const heroImage = document.querySelector<HTMLImageElement>('.hero__media img')
const boot = document.querySelector<HTMLElement>('.boot')
const progress = document.querySelector<HTMLElement>('[data-scroll-progress]')
const video = document.querySelector<HTMLVideoElement>('[data-training-video]')
const videoToggle = document.querySelector<HTMLButtonElement>('[data-video-toggle]')

function configureWhatsApp() {
  const raw = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-whatsapp]')
  const status = document.querySelector<HTMLElement>('[data-whatsapp-status]')

  if (raw.length >= 10) {
    const text = encodeURIComponent('Olá! Vim pelo site da CT Black Dragon e quero saber como agendar uma aula de boxe.')
    links.forEach((link) => {
      link.href = `https://wa.me/${raw}?text=${text}`
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    })
    status?.remove()
    return
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      status?.animate(
        [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: .45, transform: 'translateY(2px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 420, easing: 'ease-out' },
      )
    })
  })
}

function setupMenu() {
  if (!menuToggle || !nav) return

  const close = () => {
    menuToggle.setAttribute('aria-expanded', 'false')
    nav.classList.remove('is-open')
    body.style.overflow = ''
  }

  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true'
    menuToggle.setAttribute('aria-expanded', String(open))
    nav.classList.toggle('is-open', open)
    body.style.overflow = open ? 'hidden' : ''
  })

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close))
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close()
  })
}

function setupHeader() {
  if (!header) return
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > window.innerHeight * .72)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

function setupProgress() {
  if (!progress) return
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    progress.style.transform = `scaleY(${value})`
  }
  update()
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })
}

function splitHeadings() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((heading) => {
    if (heading.dataset.splitReady === 'true') return
    heading.dataset.splitReady = 'true'

    const nodes = Array.from(heading.childNodes)
    heading.textContent = ''

    const lines: HTMLElement[] = []
    let line = document.createElement('span')
    line.className = 'split-line'
    let inner = document.createElement('span')
    line.append(inner)
    heading.append(line)
    lines.push(inner)

    nodes.forEach((node) => {
      if (node.nodeName === 'BR') {
        line = document.createElement('span')
        line.className = 'split-line'
        inner = document.createElement('span')
        line.append(inner)
        heading.append(line)
        lines.push(inner)
      } else if (node.textContent) {
        inner.append(document.createTextNode(node.textContent))
      }
    })

    heading.dataset.splitCount = String(lines.length)
  })
}

function animateIntro() {
  if (!boot) return

  if (reduceMotion) {
    boot.remove()
    return
  }

  const line = boot.querySelector<HTMLElement>('.boot__line span')
  const finish = () => {
    const tl = gsap.timeline({ onComplete: () => boot.remove() })
    tl.to(line, { scaleX: 1, duration: .32, ease: 'power2.out' })
      .to(boot, { yPercent: -100, duration: .75, ease: 'power4.inOut' }, '+=.05')
      .fromTo('.site-header', { y: -28, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' }, '-=.32')
      .fromTo('.hero__title span', { yPercent: 115 }, { yPercent: 0, stagger: .08, duration: .88, ease: 'power4.out' }, '-=.35')
      .fromTo('.hero .eyebrow, .hero__bottom', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: .08, duration: .55, ease: 'power3.out' }, '-=.5')
  }

  if (heroImage?.complete) {
    finish()
  } else {
    const timeout = window.setTimeout(finish, 1800)
    heroImage?.addEventListener('load', () => {
      window.clearTimeout(timeout)
      finish()
    }, { once: true })
  }
}

function setupMotion() {
  if (reduceMotion) return

  gsap.set('[data-reveal]', { y: 28, opacity: 0 })
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: .82,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
      },
    })
  })

  document.querySelectorAll<HTMLElement>('[data-split]').forEach((heading) => {
    const lines = heading.querySelectorAll<HTMLElement>('.split-line > span')
    gsap.fromTo(lines,
      { yPercent: 115 },
      {
        yPercent: 0,
        stagger: .08,
        duration: .95,
        ease: 'power4.out',
        scrollTrigger: { trigger: heading, start: 'top 84%', once: true },
      },
    )
  })

  gsap.to('[data-hero-media] img', {
    scale: 1.15,
    yPercent: 5,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })

  gsap.to('[data-hero-veil]', {
    opacity: 1,
    backgroundColor: 'rgba(5,4,6,.45)',
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: '20% top', end: 'bottom top', scrub: true },
  })

  gsap.to('.ritual__media img', {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: '.ritual', start: 'top bottom', end: 'bottom top', scrub: true },
  })

  const frame = document.querySelector<HTMLElement>('[data-gloves-frame]')
  if (frame) {
    gsap.fromTo(frame,
      { clipPath: 'inset(14% 18% 14% 18%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top 88%', end: 'center 54%', scrub: true },
      },
    )
    gsap.to(frame.querySelector('img'), {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top 88%', end: 'bottom 20%', scrub: true },
    })
  }

  const desktop = window.matchMedia('(min-width: 981px)')
  if (desktop.matches) {
    const beats = Array.from(document.querySelectorAll<HTMLElement>('[data-method-beat]'))
    beats.forEach((beat, index) => {
      if (index === 0) gsap.set(beat, { opacity: 1, y: 0 })
      else gsap.set(beat, { opacity: 0, y: 30 })
    })

    const methodTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.method',
        start: 'top top',
        end: 'bottom bottom',
        scrub: .5,
      },
    })

    beats.forEach((beat, index) => {
      if (index === 0) return
      const previous = beats[index - 1]
      methodTimeline
        .to(previous, { opacity: 0, y: -30, duration: .35, ease: 'power2.inOut' })
        .fromTo(beat, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .45, ease: 'power2.out' }, '<.08')
    })
  }

  const words = Array.from(document.querySelectorAll<HTMLElement>('[data-film-word]'))
  words.forEach((word, index) => gsap.set(word, { opacity: index === 0 ? 1 : 0, y: index === 0 ? 0 : 28, scale: .98 }))

  const filmTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.film',
      start: 'top top',
      end: 'bottom bottom',
      scrub: .45,
      onEnter: () => video?.play().catch(() => undefined),
      onEnterBack: () => video?.play().catch(() => undefined),
    },
  })
  words.forEach((word, index) => {
    if (index === 0) return
    const previous = words[index - 1]
    filmTimeline
      .to(previous, { opacity: 0, y: -26, scale: 1.02, duration: .3, ease: 'power2.in' })
      .fromTo(word, { opacity: 0, y: 28, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: .42, ease: 'power3.out' }, '<.02')
  })
}

function setupVideoControl() {
  if (!video || !videoToggle) return
  video.muted = true

  const render = () => {
    const paused = video.paused
    videoToggle.textContent = paused ? 'REPRODUZIR' : 'PAUSAR'
    videoToggle.setAttribute('aria-pressed', String(paused))
  }

  videoToggle.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => undefined)
    else video.pause()
    render()
  })

  video.addEventListener('play', render)
  video.addEventListener('pause', render)
  render()
}

function setupYear() {
  const year = document.querySelector<HTMLElement>('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())
}

splitHeadings()
configureWhatsApp()
setupMenu()
setupHeader()
setupProgress()
setupVideoControl()
setupYear()
animateIntro()

requestAnimationFrame(() => {
  setupMotion()
  ScrollTrigger.refresh()
})
