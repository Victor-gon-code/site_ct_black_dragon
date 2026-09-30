import '@fontsource/barlow-condensed/400.css'
import '@fontsource/barlow-condensed/900.css'
import './styles.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const body = document.body
const header = document.querySelector<HTMLElement>('[data-header]')
const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle')
const nav = document.querySelector<HTMLElement>('#site-nav')
const heroImage = document.querySelector<HTMLImageElement>('.hero__media img')
const boot = document.querySelector<HTMLElement>('.boot')
const progress = document.querySelector<HTMLElement>('[data-scroll-progress]')
const video = document.querySelector<HTMLVideoElement>('[data-training-video]')
const videoToggle = document.querySelector<HTMLButtonElement>('[data-video-toggle]')
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

function configureWhatsApp() {
  const fallbackNumber = '555592236719'
  const envNumber = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
  const raw = envNumber.length >= 10 && envNumber.length <= 15 ? envNumber : fallbackNumber
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-whatsapp]')
  const text = encodeURIComponent('Oi, Willian! Vi o site da CT Black Dragon e queria saber como funciona para fazer um primeiro treino.')

  links.forEach((link) => {
    link.href = `https://wa.me/${raw}?text=${text}`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.removeAttribute('aria-disabled')
  })
}

function setupMenu() {
  if (!menuToggle || !nav) return

  const mobileQuery = window.matchMedia('(max-width: 980px)')
  let previousOverflow = ''

  const isOpen = () => menuToggle.getAttribute('aria-expanded') === 'true'

  const close = (restoreFocus = false) => {
    if (!isOpen()) return
    menuToggle.setAttribute('aria-expanded', 'false')
    nav.classList.remove('is-open')
    body.style.overflow = previousOverflow
    if (restoreFocus) menuToggle.focus()
  }

  const open = () => {
    if (isOpen()) return
    previousOverflow = body.style.overflow
    menuToggle.setAttribute('aria-expanded', 'true')
    nav.classList.add('is-open')
    body.style.overflow = 'hidden'

    requestAnimationFrame(() => {
      nav.querySelector<HTMLAnchorElement>('a[href]')?.focus()
    })
  }

  menuToggle.addEventListener('click', () => {
    if (isOpen()) close()
    else open()
  })

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => close())
  })

  window.addEventListener('keydown', (event) => {
    if (!isOpen()) return

    if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
      return
    }

    if (event.key !== 'Tab') return

    const focusable = [
      menuToggle,
      ...Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href]')),
    ]
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  })

  mobileQuery.addEventListener('change', (event) => {
    if (!event.matches) close()
  })

  window.addEventListener('pageshow', () => {
    if (!isOpen()) body.style.overflow = ''
  })
}

function setupViewportUI() {
  let frame = 0

  const update = () => {
    frame = 0

    if (header) {
      header.classList.toggle('is-solid', window.scrollY > window.innerHeight * .72)
    }

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progress.style.transform = `scaleY(${value})`
    }
  }

  const scheduleUpdate = () => {
    if (frame) return
    frame = requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate, { passive: true })
}

function splitHeadings() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((heading) => {
    if (heading.dataset.splitReady === 'true') return

    const nodes = Array.from(heading.childNodes)
    const fragment = document.createDocumentFragment()
    let lineCount = 0

    const createLine = () => {
      const line = document.createElement('span')
      const inner = document.createElement('span')
      line.className = 'split-line'
      line.append(inner)
      fragment.append(line)
      lineCount += 1
      return inner
    }

    let inner = createLine()

    nodes.forEach((node) => {
      if (node.nodeName === 'BR') {
        inner = createLine()
        return
      }

      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        inner.append(document.createTextNode(node.textContent))
        return
      }

      if (node instanceof HTMLElement) {
        inner.append(node.cloneNode(true))
      }
    })

    heading.replaceChildren(fragment)
    heading.dataset.splitReady = 'true'
    heading.dataset.splitCount = String(lineCount)
  })
}

function animateIntro() {
  if (!boot) return

  if (reducedMotionQuery.matches) {
    boot.remove()
    return
  }

  let finished = false
  let timeout = 0

  const finish = () => {
    if (finished) return
    finished = true
    if (timeout) window.clearTimeout(timeout)

    const line = boot.querySelector<HTMLElement>('.boot__line span')
    const timeline = gsap.timeline({ onComplete: () => boot.remove() })

    if (line) {
      timeline.to(line, { scaleX: 1, duration: .3, ease: 'power2.out' })
    }

    timeline
      .to(boot, { yPercent: -100, duration: .72, ease: 'power4.inOut' }, line ? '+=.04' : 0)
      .fromTo('.site-header', { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: .55, ease: 'power3.out' }, '-=.3')
      .fromTo('.hero__title span', { yPercent: 112 }, { yPercent: 0, stagger: .075, duration: .84, ease: 'power4.out' }, '-=.34')
      .fromTo('.hero .eyebrow, .hero__bottom', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: .075, duration: .5, ease: 'power3.out' }, '-=.48')
  }

  if (!heroImage || heroImage.complete) {
    finish()
    return
  }

  timeout = window.setTimeout(finish, 1600)
  heroImage.addEventListener('load', finish, { once: true })
  heroImage.addEventListener('error', finish, { once: true })
}

function setupMotion() {
  const media = gsap.matchMedia()

  media.add('(prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
      if (element.closest('.hero')) return

      gsap.fromTo(
        element,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: .82,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true,
          },
        },
      )
    })

    document.querySelectorAll<HTMLElement>('[data-split]').forEach((heading) => {
      const lines = heading.querySelectorAll<HTMLElement>('.split-line > span')
      if (!lines.length) return

      gsap.fromTo(
        lines,
        { yPercent: 112 },
        {
          yPercent: 0,
          stagger: .075,
          duration: .92,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 84%',
            once: true,
          },
        },
      )
    })

    const heroMedia = document.querySelector<HTMLElement>('[data-hero-media] img')
    if (heroMedia) {
      gsap.to(heroMedia, {
        scale: 1.15,
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    const heroVeil = document.querySelector<HTMLElement>('[data-hero-veil]')
    if (heroVeil) {
      gsap.fromTo(
        heroVeil,
        { opacity: .82 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: '18% top',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }

    const ritualImage = document.querySelector<HTMLElement>('.ritual__media img')
    if (ritualImage) {
      gsap.to(ritualImage, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.ritual',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    const words = Array.from(document.querySelectorAll<HTMLElement>('[data-film-word]'))

    if (words.length) {
      let activeWord = -1

      const showWord = (nextIndex: number) => {
        const clamped = Math.max(0, Math.min(words.length - 1, nextIndex))
        if (clamped === activeWord) return

        activeWord = clamped
        gsap.killTweensOf(words)

        words.forEach((word, index) => {
          const active = index === clamped
          gsap.set(word, {
            autoAlpha: active ? 1 : 0,
            y: active ? 0 : 24,
            scale: active ? 1 : .985,
          })
        })
      }

      showWord(0)

      ScrollTrigger.create({
        trigger: '.film',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const nextIndex = Math.min(
            words.length - 1,
            Math.floor(self.progress * words.length),
          )
          showWord(nextIndex)
        },
      })
    }
  })

  media.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
    const frame = document.querySelector<HTMLElement>('[data-gloves-frame]')
    const glovesImage = frame?.querySelector<HTMLElement>('img')

    if (!frame) return

    gsap.fromTo(
      frame,
      { clipPath: 'inset(10% 12% 10% 12%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: frame,
          start: 'top 94%',
          end: 'center 54%',
          scrub: true,
        },
      },
    )

    if (glovesImage) {
      gsap.to(glovesImage, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: frame,
          start: 'top 94%',
          end: 'center 54%',
          scrub: true,
        },
      })
    }
  })

  media.add('(min-width: 981px) and (prefers-reduced-motion: no-preference)', () => {
    const beats = Array.from(document.querySelectorAll<HTMLElement>('[data-method-beat]'))

    if (!beats.length) return

    let activeBeat = -1

    const showBeat = (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(beats.length - 1, nextIndex))
      if (clamped === activeBeat) return

      activeBeat = clamped
      gsap.killTweensOf(beats)

      beats.forEach((beat, index) => {
        const active = index === clamped
        gsap.set(beat, {
          autoAlpha: active ? 1 : 0,
          y: active ? 0 : 26,
        })
      })
    }

    showBeat(0)

    ScrollTrigger.create({
      trigger: '.method',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const nextIndex = Math.min(
          beats.length - 1,
          Math.floor(self.progress * beats.length),
        )
        showBeat(nextIndex)
      },
    })
  })
}

function setupVideoPlayback() {
  if (!video || !videoToggle) return

  const source = video.querySelector<HTMLSourceElement>('source')
  let loaded = source?.hasAttribute('src') ?? false
  let inView = false
  let userMode: 'auto' | 'paused' | 'playing' = 'auto'

  const ensureLoaded = () => {
    if (loaded || !source) return
    const deferredSrc = source.dataset.src
    if (!deferredSrc) return

    source.src = deferredSrc
    source.removeAttribute('data-src')
    video.load()
    loaded = true
  }

  const render = () => {
    const paused = video.paused
    videoToggle.textContent = paused ? 'REPRODUZIR' : 'PAUSAR'
    videoToggle.setAttribute('aria-label', paused ? 'Reproduzir vídeo do treino' : 'Pausar vídeo do treino')
  }

  const safePlay = () => {
    ensureLoaded()
    void video.play().catch(() => render())
  }

  const sync = () => {
    if (document.hidden || !inView || userMode === 'paused') {
      video.pause()
      return
    }

    if (userMode === 'playing' || !reducedMotionQuery.matches) {
      safePlay()
      return
    }

    video.pause()
  }

  video.muted = true

  videoToggle.addEventListener('click', () => {
    userMode = video.paused ? 'playing' : 'paused'
    sync()
  })

  video.addEventListener('play', render)
  video.addEventListener('pause', render)
  reducedMotionQuery.addEventListener('change', sync)
  document.addEventListener('visibilitychange', sync)

  if ('IntersectionObserver' in window) {
    const preloadObserver = new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        ensureLoaded()
        observer.disconnect()
      },
      { rootMargin: '120% 0px' },
    )

    const playbackObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        inView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= .12)
        sync()
      },
      { threshold: [0, .12, .35] },
    )

    preloadObserver.observe(video)
    playbackObserver.observe(video)
  } else {
    inView = true
    ensureLoaded()
    sync()
  }

  window.addEventListener('pagehide', () => video.pause())
  render()
}

function setupRefreshes() {
  const refresh = () => ScrollTrigger.refresh()

  if (document.fonts) {
    void document.fonts.ready.then(refresh)
  }

  if (document.readyState === 'complete') {
    refresh()
  } else {
    window.addEventListener('load', refresh, { once: true })
  }

  window.addEventListener('pageshow', refresh)
}

function setupYear() {
  const year = document.querySelector<HTMLElement>('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())
}

splitHeadings()
configureWhatsApp()
setupMenu()
setupViewportUI()
setupYear()
animateIntro()
setupMotion()
setupVideoPlayback()
setupRefreshes()
