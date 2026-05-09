import { isSupabaseConfigured, supabase } from './supabaseClient.js'

const STUDENT_KEY = 'zqt_students'
const FEEDBACK_KEY = 'zqt_feedbacks'

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function toStudent(row, progressRecords) {
  return {
    id: row.id,
    name: row.name,
    className: row.class_name,
    queryCode: row.query_code,
    parentName: row.parent_name,
    progress: progressRecords
      .filter((item) => item.student_id === row.id)
      .map((item) => ({
        id: item.id,
        date: item.record_date,
        text: item.text,
      })),
  }
}

function toFeedback(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    date: row.feedback_date,
    homework: row.homework,
    focus: row.focus,
    mistakes: row.mistakes,
    evaluation: row.evaluation,
    reminder: row.reminder,
  }
}

export function isCloudEnabled() {
  return isSupabaseConfigured
}

export async function loadSchoolData(initialStudents, initialFeedbacks) {
  if (!isSupabaseConfigured) {
    return {
      source: 'local',
      students: readStorage(STUDENT_KEY, initialStudents),
      feedbacks: readStorage(FEEDBACK_KEY, initialFeedbacks),
    }
  }

  const [studentsResult, feedbacksResult, progressResult] = await Promise.all([
    supabase.from('students').select('*').order('created_at', { ascending: false }),
    supabase.from('feedbacks').select('*').order('feedback_date', { ascending: false }),
    supabase.from('progress_records').select('*').order('record_date', { ascending: false }),
  ])

  if (studentsResult.error) throw studentsResult.error
  if (feedbacksResult.error) throw feedbacksResult.error
  if (progressResult.error) throw progressResult.error

  return {
    source: 'cloud',
    students: studentsResult.data.map((row) => toStudent(row, progressResult.data)),
    feedbacks: feedbacksResult.data.map(toFeedback),
  }
}

export async function saveStudentRecord(student, currentStudents, useLocalOnly = false) {
  if (!isSupabaseConfigured || useLocalOnly) {
    const nextStudents = [student, ...currentStudents]
    saveStorage(STUDENT_KEY, nextStudents)
    return student
  }

  const { data, error } = await supabase
    .from('students')
    .insert({
      id: student.id,
      name: student.name,
      class_name: student.className,
      query_code: student.queryCode,
      parent_name: student.parentName,
    })
    .select()
    .single()

  if (error) throw error
  return toStudent(data, [])
}

export async function saveFeedbackRecord(feedback, currentFeedbacks, useLocalOnly = false) {
  if (!isSupabaseConfigured || useLocalOnly) {
    const nextFeedbacks = [feedback, ...currentFeedbacks]
    saveStorage(FEEDBACK_KEY, nextFeedbacks)
    return feedback
  }

  const { data, error } = await supabase
    .from('feedbacks')
    .insert({
      id: feedback.id,
      student_id: feedback.studentId,
      feedback_date: feedback.date,
      homework: feedback.homework,
      focus: feedback.focus,
      mistakes: feedback.mistakes,
      evaluation: feedback.evaluation,
      reminder: feedback.reminder,
    })
    .select()
    .single()

  if (error) throw error
  return toFeedback(data)
}

export async function saveProgressRecord(progress, studentId, currentStudents, useLocalOnly = false) {
  if (!isSupabaseConfigured || useLocalOnly) {
    const nextStudents = currentStudents.map((student) =>
      student.id === studentId
        ? { ...student, progress: [progress, ...(student.progress || [])] }
        : student,
    )
    saveStorage(STUDENT_KEY, nextStudents)
    return progress
  }

  const { data, error } = await supabase
    .from('progress_records')
    .insert({
      id: progress.id,
      student_id: studentId,
      record_date: progress.date,
      text: progress.text,
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    date: data.record_date,
    text: data.text,
  }
}
