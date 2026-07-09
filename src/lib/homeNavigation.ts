export const ASK_OFFICEFLOW_SECTION_ID = 'ask-officeflow'
export const ASK_OFFICEFLOW_SEARCH_ID = 'assistant-hero-search'

export function scrollToAskOfficeFlowHero(options?: { focusSearch?: boolean }): void {
  const section = document.getElementById(ASK_OFFICEFLOW_SECTION_ID)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const shouldFocus =
    options?.focusSearch ?? window.matchMedia('(min-width: 768px)').matches
  if (!shouldFocus) return

  window.setTimeout(() => {
    document.getElementById(ASK_OFFICEFLOW_SEARCH_ID)?.focus({ preventScroll: true })
  }, 350)
}
