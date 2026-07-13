export const ASSISTANT_DATA_UPDATED_EVENT = 'officeflow:assistant-data-updated'
export const MEETING_DATA_UPDATED_EVENT = 'officeflow:meeting-data-updated'

export function notifyAssistantDataUpdated() {
  window.dispatchEvent(new CustomEvent(ASSISTANT_DATA_UPDATED_EVENT))
}

export function notifyMeetingDataUpdated() {
  window.dispatchEvent(new CustomEvent(MEETING_DATA_UPDATED_EVENT))
}
