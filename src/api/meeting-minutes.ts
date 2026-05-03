import request from '@/utils/http'


export interface MeetingMinutesForm {
  projectName: string
  meetingTitle: string
  meetingType: string
  meetingContent: string
  attendeeHints: string[]
  outputStyle: string
}

export interface MeetingTaskItem {
  taskName: string
  owner: string
  dueDate: string
  priority: string
  status: string
  note: string
}

export interface MeetingMinutesResult {
  projectName: string
  meetingTitle: string
  meetingType: string
  summary: string
  attendeeList: string[]
  keyDecisions: string[]
  actionItems: MeetingTaskItem[]
  riskWarnings: string[]
  followUpSuggestions: string[]
}

export interface MeetingEmailRequest {
  subject: string
  recipientEmails: string[]
  meetingData: MeetingMinutesResult
}


const API_PREFIX = '/api/common/meeting-minutes'

export function analyzeMeetingMinutes (data: MeetingMinutesForm) {
  return request.post<MeetingMinutesResult>({
    url: `${API_PREFIX}/analyze`,
    data,
    timeout: 120000
  })
}

export function sendMeetingMinutesEmail (data: MeetingEmailRequest) {
  return request.post<string>({
    url: `${API_PREFIX}/send-email`,
    data,
    timeout: 60000,
    showSuccessMessage: true
  })
}

export function getMeetingDemo () {
  return request.get<{
    meetingTitle: string
    meetingType: string
    meetingContent: string
  }>({
    url: `${API_PREFIX}/demo`
  })
}
