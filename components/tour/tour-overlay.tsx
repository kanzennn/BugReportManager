'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { completeTourAction } from '@/app/actions/tour'

const PAD = 8
const TOOLTIP_W = 296
const TOOLTIP_H = 224

const STEPS: { target: string | null; titleKey: string; descKey: string }[] = [
  { target: null,               titleKey: 'tour.welcome.title',      descKey: 'tour.welcome.desc' },
  { target: 'nav-dashboard',    titleKey: 'tour.dashboard.title',    descKey: 'tour.dashboard.desc' },
  { target: 'nav-applications', titleKey: 'tour.applications.title', descKey: 'tour.applications.desc' },
  { target: 'nav-bugs',         titleKey: 'tour.bugs.title',         descKey: 'tour.bugs.desc' },
  { target: 'nav-feedback',     titleKey: 'tour.feedback.title',     descKey: 'tour.feedback.desc' },
  { target: 'nav-members',      titleKey: 'tour.members.title',      descKey: 'tour.members.desc' },
  { target: 'nav-billing',      titleKey: 'tour.billing.title',      descKey: 'tour.billing.desc' },
  { target: 'nav-settings',     titleKey: 'tour.settings.title',     descKey: 'tour.settings.desc' },
  { target: 'nav-profile',      titleKey: 'tour.profile.title',      descKey: 'tour.profile.desc' },
]

interface TourOverlayProps {
  tourCompleted: boolean
}

export function TourOverlay({ tourCompleted }: TourOverlayProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!tourCompleted) setVisible(true)
  }, [tourCompleted])

  const updateRect = useCallback(() => {
    const target = STEPS[step].target
    if (!target) { setRect(null); return }
    const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`)
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    setRect(r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 ? r : null)
  }, [step])

  useEffect(() => { updateRect() }, [updateRect])
  useEffect(() => {
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [updateRect])

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else finish()
  }
  function back() { if (step > 0) setStep(s => s - 1) }
  function finish() {
    setVisible(false)
    completeTourAction()
  }

  if (!visible) return null

  const { titleKey, descKey } = STEPS[step]
  const showSpotlight = rect !== null

  let tooltipStyle: React.CSSProperties
  if (showSpotlight && rect) {
    const leftCandidate = rect.right + 16
    const left = leftCandidate + TOOLTIP_W > window.innerWidth
      ? window.innerWidth - TOOLTIP_W - 16
      : leftCandidate
    const idealTop = rect.top + rect.height / 2 - TOOLTIP_H / 2
    const top = Math.max(16, Math.min(idealTop, window.innerHeight - TOOLTIP_H - 16))
    tooltipStyle = {
      position: 'fixed',
      left,
      top,
      width: TOOLTIP_W,
      zIndex: 102,
    }
  } else {
    tooltipStyle = {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: `min(${TOOLTIP_W}px, calc(100vw - 32px))`,
      zIndex: 102,
    }
  }

  return (
    <div className="fixed inset-0" style={{ zIndex: 100, pointerEvents: 'none' }}>
      {/* Darkened overlay with spotlight cutout */}
      {showSpotlight && rect ? (
        <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <mask id="brm-tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={rect.left - PAD}
                y={rect.top - PAD}
                width={rect.width + PAD * 2}
                height={rect.height + PAD * 2}
                rx={8}
                fill="black"
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#brm-tour-mask)" />
        </svg>
      ) : (
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.72)' }} />
      )}

      {/* Highlight ring around target */}
      {showSpotlight && rect && (
        <div
          style={{
            position: 'fixed',
            left: rect.left - PAD,
            top: rect.top - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: 8,
            boxShadow: '0 0 0 2px rgb(129 140 248), 0 0 16px 2px rgba(99 102 241 / 0.4)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{ ...tooltipStyle, pointerEvents: 'all' }}
        className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl"
      >
        {/* Step dots + close */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === step
                    ? 'w-4 bg-indigo-400'
                    : i < step
                      ? 'w-1.5 bg-indigo-700'
                      : 'w-1.5 bg-zinc-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={finish}
            className="ml-3 flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label={t('tour.skip')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Welcome icon */}
        {step === 0 && (
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
        )}

        <p className="mb-1 text-[11px] font-medium text-zinc-500">
          {step + 1} / {STEPS.length}
        </p>
        <h3 className="mb-2 text-sm font-semibold text-zinc-100">{t(titleKey)}</h3>
        <p className="mb-5 text-sm leading-relaxed text-zinc-400">{t(descKey)}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={finish}
            className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {t('tour.skip')}
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={back}
                className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <ChevronLeft className="h-3 w-3" />
                {t('tour.back')}
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
            >
              {step === STEPS.length - 1 ? t('tour.finish') : t('tour.next')}
              {step < STEPS.length - 1 && <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
