export const ASSISTANT_DATA_UPDATED_EVENT = 'officeflow:assistant-data-updated'

export function notifyAssistantDataUpdated() {
  window.dispatchEvent(new CustomEvent(ASSISTANT_DATA_UPDATED_EVENT))
}
