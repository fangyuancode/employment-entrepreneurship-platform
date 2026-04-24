import axios from 'axios'

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

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

const BASE_URL = 'http://localhost:9091/api/common/meeting-minutes'

export function analyzeMeetingMinutes (data: MeetingMinutesForm) {
  return axios.post<ApiResponse<MeetingMinutesResult>>(`${BASE_URL}/analyze`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function sendMeetingMinutesEmail (data: MeetingEmailRequest) {
  return axios.post<ApiResponse<string>>(`${BASE_URL}/send-email`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function getMeetingDemo () {
  return axios.get<ApiResponse<{
    meetingTitle: string
    meetingType: string
    meetingContent: string
  }>>(`${BASE_URL}/demo`)
}