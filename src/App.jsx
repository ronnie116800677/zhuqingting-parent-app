import { useEffect, useMemo, useState } from 'react'
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  GraduationCap,
  KeyRound,
  Lightbulb,
  LockKeyhole,
  MessageCircleHeart,
  Plus,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
} from 'lucide-react'
import {
  isCloudEnabled,
  loadSchoolData,
  saveFeedbackRecord,
  saveProgressRecord,
  saveStudentRecord,
} from './dataStore.js'

const TEACHER_PASSWORD = 'zqt2026'

const today = new Date()

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(date.getDate() + days)
  return next
}

const initialStudents = [
  {
    id: 'stu-chen-yiran',
    name: '陈一然',
    className: '三年级思维提升班',
    queryCode: 'CYR2026',
    parentName: '陈一然妈妈',
    progress: [
      {
        id: 'pro-1',
        date: toDateInputValue(addDays(today, -5)),
        text: '主动检查应用题单位，订正速度明显变快。',
      },
      {
        id: 'pro-2',
        date: toDateInputValue(addDays(today, -1)),
        text: '课堂举手次数增加，愿意完整说出解题思路。',
      },
    ],
  },
  {
    id: 'stu-lin-xiaomu',
    name: '林小沐',
    className: '五年级阅读表达班',
    queryCode: 'LXM2026',
    parentName: '林小沐爸爸',
    progress: [
      {
        id: 'pro-3',
        date: toDateInputValue(addDays(today, -4)),
        text: '阅读批注更细，能圈出关键词并归纳段意。',
      },
    ],
  },
]

const initialFeedbacks = [
  {
    id: 'fb-1',
    studentId: 'stu-chen-yiran',
    date: toDateInputValue(addDays(today, -4)),
    homework: '按时完成，书写整洁',
    focus: 4,
    mistakes: '计算题有两处粗心，已完成订正。',
    evaluation: '今天解题思路清楚，能够主动讲出为什么这样列式。',
    reminder: '回家再练 2 道同类型应用题，注意单位换算。',
  },
  {
    id: 'fb-2',
    studentId: 'stu-chen-yiran',
    date: toDateInputValue(addDays(today, -1)),
    homework: '完成较好，订正及时',
    focus: 5,
    mistakes: '错题集中在审题关键词漏看。',
    evaluation: '专注度很棒，课堂互动积极，已经能自己复盘错误原因。',
    reminder: '今晚复习课堂笔记第 2 页，把关键词画出来。',
  },
  {
    id: 'fb-3',
    studentId: 'stu-lin-xiaomu',
    date: toDateInputValue(addDays(today, -2)),
    homework: '基本完成，作文需要补充细节',
    focus: 4,
    mistakes: '阅读题第 3 题概括不够完整。',
    evaluation: '能跟上课堂节奏，表达比上周更自然。',
    reminder: '亲子共读 15 分钟，请孩子口头复述文章主旨。',
  },
]

const emptyStudentForm = {
  name: '',
  className: '',
  queryCode: '',
  parentName: '',
}

const emptyFeedbackForm = {
  studentId: '',
  date: toDateInputValue(today),
  homework: '',
  focus: 4,
  mistakes: '',
  evaluation: '',
  reminder: '',
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date))
}

function getWeekStart(date) {
  const copied = new Date(date)
  const day = copied.getDay() || 7
  copied.setHours(0, 0, 0, 0)
  copied.setDate(copied.getDate() - day + 1)
  return copied
}

function isThisWeek(dateText) {
  const target = new Date(`${dateText}T00:00:00`)
  return target >= getWeekStart(new Date())
}

function focusText(value) {
  if (value >= 5) return '非常专注'
  if (value >= 4) return '比较专注'
  if (value >= 3) return '基本稳定'
  return '需要提醒'
}

function buildFeedbackText(student, feedback) {
  return `【竹蜻蜓教育】${student.name} ${feedback.date} 学习反馈

作业完成：${feedback.homework}
专注表现：${focusText(Number(feedback.focus))}（${feedback.focus}/5）
错题情况：${feedback.mistakes}
老师评价：${feedback.evaluation}
老师提醒：${feedback.reminder}`
}

function buildWeeklySummary(student, feedbacks) {
  const weekFeedbacks = sortByDateDesc(feedbacks.filter((item) => item.studentId === student.id && isThisWeek(item.date)))

  if (weekFeedbacks.length === 0) {
    return `${student.name} 本周还没有录入反馈。`
  }

  const focusAverage =
    weekFeedbacks.reduce((total, item) => total + Number(item.focus), 0) / weekFeedbacks.length
  const latest = weekFeedbacks[0]

  return `${student.name} 本周共收到 ${weekFeedbacks.length} 条学习反馈，平均专注表现 ${focusAverage.toFixed(
    1,
  )}/5，整体状态为“${focusText(Math.round(focusAverage))}”。最近一次反馈中，老师评价：${
    latest.evaluation
  } 家庭配合建议：${latest.reminder}`
}

function buildProgressSummary(student) {
  if (!student.progress?.length) return '暂未记录进步点。'
  return sortByDateDesc(student.progress)
    .map((item) => `${item.date}：${item.text}`)
    .join('\n')
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="empty-state">
      <div>{icon}</div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

function App() {
  const [mode, setMode] = useState('parent')
  const [students, setStudents] = useState(initialStudents)
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks)
  const [queryCode, setQueryCode] = useState('')
  const [selectedParentStudentId, setSelectedParentStudentId] = useState('')
  const [teacherPassword, setTeacherPassword] = useState('')
  const [teacherAuthed, setTeacherAuthed] = useState(false)
  const [teacherMessage, setTeacherMessage] = useState('')
  const [studentForm, setStudentForm] = useState(emptyStudentForm)
  const [feedbackForm, setFeedbackForm] = useState(emptyFeedbackForm)
  const [progressText, setProgressText] = useState('')
  const [copiedText, setCopiedText] = useState('')
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState(isCloudEnabled() ? 'cloud' : 'local')
  const [dataMessage, setDataMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadData() {
      try {
        const result = await loadSchoolData(initialStudents, initialFeedbacks)
        if (ignore) return
        setStudents(result.students)
        setFeedbacks(result.feedbacks)
        setDataSource(result.source)
        setDataMessage('')
      } catch (error) {
        if (ignore) return
        setDataSource('local')
        setDataMessage(`云端数据连接失败，已临时使用本地数据：${error.message}`)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadData()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!feedbackForm.studentId && students.length) {
      setFeedbackForm((form) => ({ ...form, studentId: students[0].id }))
    }
  }, [students, feedbackForm.studentId])

  const parentStudent = useMemo(
    () => students.find((student) => student.id === selectedParentStudentId),
    [students, selectedParentStudentId],
  )

  const parentFeedbacks = useMemo(
    () => (parentStudent ? sortByDateDesc(feedbacks.filter((item) => item.studentId === parentStudent.id)) : []),
    [feedbacks, parentStudent],
  )

  const selectedTeacherStudent = students.find((student) => student.id === feedbackForm.studentId)

  async function copyText(text, label = '内容') {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(`${label}已复制`)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedText(`${label}已复制`)
    }

    window.setTimeout(() => setCopiedText(''), 1800)
  }

  function handleParentSearch(event) {
    event.preventDefault()
    const matched = students.find((student) => student.queryCode.toLowerCase() === queryCode.trim().toLowerCase())
    setSelectedParentStudentId(matched?.id || '')
  }

  function handleTeacherLogin(event) {
    event.preventDefault()
    if (teacherPassword === TEACHER_PASSWORD) {
      setTeacherAuthed(true)
      setTeacherMessage('')
      return
    }
    setTeacherMessage('后台密码不正确，请重新输入。')
  }

  async function handleAddStudent(event) {
    event.preventDefault()
    const queryCode = studentForm.queryCode.trim().toUpperCase()
    if (!studentForm.name.trim() || !studentForm.className.trim() || !queryCode) {
      setTeacherMessage('请填写学生姓名、班级和查询码。')
      return
    }

    if (students.some((student) => student.queryCode.toUpperCase() === queryCode)) {
      setTeacherMessage('这个查询码已经被使用，请换一个。')
      return
    }

    const newStudent = {
      id: `stu-${Date.now()}`,
      name: studentForm.name.trim(),
      className: studentForm.className.trim(),
      queryCode,
      parentName: studentForm.parentName.trim() || '家长',
      progress: [],
    }

    try {
      const savedStudent = await saveStudentRecord(newStudent, students, dataSource !== 'cloud')
      setStudents((items) => [savedStudent, ...items])
      setStudentForm(emptyStudentForm)
      setFeedbackForm((form) => ({ ...form, studentId: savedStudent.id }))
      setTeacherMessage(dataSource === 'cloud' ? '学生已添加到云端。' : '学生已添加到本地。')
    } catch (error) {
      setTeacherMessage(`保存失败：${error.message}`)
    }
  }

  async function handleAddFeedback(event) {
    event.preventDefault()
    if (!feedbackForm.studentId) {
      setTeacherMessage('请先选择学生。')
      return
    }

    const requiredFields = ['homework', 'mistakes', 'evaluation', 'reminder']
    const missing = requiredFields.some((field) => !feedbackForm[field].trim())
    if (missing) {
      setTeacherMessage('请完整填写每日反馈内容。')
      return
    }

    const newFeedback = {
      ...feedbackForm,
      id: `fb-${Date.now()}`,
      focus: Number(feedbackForm.focus),
    }

    try {
      const savedFeedback = await saveFeedbackRecord(newFeedback, feedbacks, dataSource !== 'cloud')
      setFeedbacks((items) => [savedFeedback, ...items])
      setFeedbackForm((form) => ({
        ...emptyFeedbackForm,
        studentId: form.studentId,
        date: toDateInputValue(today),
      }))
      setTeacherMessage(dataSource === 'cloud' ? '每日反馈已保存到云端。' : '每日反馈已保存到本地。')
    } catch (error) {
      setTeacherMessage(`保存失败：${error.message}`)
    }
  }

  async function handleAddProgress(event) {
    event.preventDefault()
    if (!selectedTeacherStudent) {
      setTeacherMessage('请先选择学生。')
      return
    }
    if (!progressText.trim()) {
      setTeacherMessage('请填写进步记录。')
      return
    }

    const progressItem = {
      id: `pro-${Date.now()}`,
      date: toDateInputValue(new Date()),
      text: progressText.trim(),
    }

    try {
      const savedProgress = await saveProgressRecord(progressItem, selectedTeacherStudent.id, students, dataSource !== 'cloud')
      setStudents((items) =>
        items.map((student) =>
          student.id === selectedTeacherStudent.id
            ? { ...student, progress: [savedProgress, ...(student.progress || [])] }
            : student,
        ),
      )
      setProgressText('')
      setTeacherMessage(dataSource === 'cloud' ? '进步记录已保存到云端。' : '进步记录已保存到本地。')
    } catch (error) {
      setTeacherMessage(`保存失败：${error.message}`)
    }
  }

  const totalThisWeek = feedbacks.filter((item) => isThisWeek(item.date)).length

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <header className="top-bar">
          <div>
            <p>竹蜻蜓教育</p>
            <h1>家长成长记录</h1>
          </div>
          <span>小程序原型</span>
        </header>

        <nav className="role-tabs" aria-label="选择身份">
          <button className={mode === 'parent' ? 'active' : ''} onClick={() => setMode('parent')}>
            <UserRound size={18} />
            家长端
          </button>
          <button className={mode === 'teacher' ? 'active' : ''} onClick={() => setMode('teacher')}>
            <GraduationCap size={18} />
            老师端
          </button>
        </nav>

        {copiedText && <div className="toast">{copiedText}</div>}
        {loading && <div className="notice">正在读取数据...</div>}
        {!loading && (
          <div className="data-source">
            {dataSource === 'cloud' ? '当前使用云端数据，多设备可同步查看。' : '当前使用本地数据，仅本机浏览器可见。'}
          </div>
        )}
        {dataMessage && <div className="notice">{dataMessage}</div>}

        {mode === 'parent' ? (
          <ParentView
            queryCode={queryCode}
            setQueryCode={setQueryCode}
            onSearch={handleParentSearch}
            student={parentStudent}
            feedbacks={parentFeedbacks}
            allFeedbacks={feedbacks}
            copyText={copyText}
            hasSearched={Boolean(queryCode.trim())}
          />
        ) : (
          <TeacherView
            students={students}
            feedbacks={feedbacks}
            teacherAuthed={teacherAuthed}
            teacherPassword={teacherPassword}
            setTeacherPassword={setTeacherPassword}
            onLogin={handleTeacherLogin}
            teacherMessage={teacherMessage}
            studentForm={studentForm}
            setStudentForm={setStudentForm}
            onAddStudent={handleAddStudent}
            feedbackForm={feedbackForm}
            setFeedbackForm={setFeedbackForm}
            onAddFeedback={handleAddFeedback}
            selectedStudent={selectedTeacherStudent}
            progressText={progressText}
            setProgressText={setProgressText}
            onAddProgress={handleAddProgress}
            copyText={copyText}
            totalThisWeek={totalThisWeek}
          />
        )}
      </section>
    </main>
  )
}

function ParentView({ queryCode, setQueryCode, onSearch, student, feedbacks, allFeedbacks, copyText, hasSearched }) {
  return (
    <div className="screen-content">
      <form className="panel search-panel" onSubmit={onSearch}>
        <label htmlFor="queryCode">家长查询码</label>
        <div className="input-with-button">
          <input
            id="queryCode"
            value={queryCode}
            onChange={(event) => setQueryCode(event.target.value)}
            placeholder="请输入老师给您的查询码"
          />
          <button type="submit" aria-label="查询">
            <Search size={18} />
          </button>
        </div>
        <p className="hint">测试查询码：CYR2026 或 LXM2026</p>
      </form>

      {!student && hasSearched ? (
        <EmptyState
          icon={<LockKeyhole size={30} />}
          title="没有找到孩子信息"
          text="请确认查询码是否与老师发送的一致。"
        />
      ) : null}

      {!student && !hasSearched ? (
        <EmptyState
          icon={<MessageCircleHeart size={30} />}
          title="输入查询码查看反馈"
          text="家长只能看到与查询码对应的孩子记录。"
        />
      ) : null}

      {student ? (
        <>
          <section className="student-hero">
            <div>
              <p>{student.className}</p>
              <h2>{student.name}</h2>
              <span>{student.parentName} · 专属成长档案</span>
            </div>
            <div className="avatar">{student.name.slice(0, 1)}</div>
          </section>

          <section className="stats-grid">
            <StatCard icon={<CalendarDays size={18} />} label="反馈总数" value={`${feedbacks.length} 条`} />
            <StatCard
              icon={<Sparkles size={18} />}
              label="本周反馈"
              value={`${feedbacks.filter((item) => isThisWeek(item.date)).length} 条`}
            />
          </section>

          <section className="panel">
            <div className="section-title">
              <div>
                <BookOpenCheck size={18} />
                <h3>本周表现总结</h3>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="复制本周总结"
                title="复制本周总结"
                onClick={() => copyText(buildWeeklySummary(student, allFeedbacks), '本周总结')}
              >
                <Clipboard size={17} />
              </button>
            </div>
            <p className="summary-text">{buildWeeklySummary(student, allFeedbacks)}</p>
          </section>

          <section className="panel">
            <div className="section-title">
              <div>
                <Lightbulb size={18} />
                <h3>进步记录</h3>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="复制进步记录"
                title="复制进步记录"
                onClick={() => copyText(buildProgressSummary(student), '进步记录')}
              >
                <Clipboard size={17} />
              </button>
            </div>
            <div className="timeline">
              {sortByDateDesc(student.progress || []).map((item) => (
                <article key={item.id} className="timeline-item">
                  <time>{item.date}</time>
                  <p>{item.text}</p>
                </article>
              ))}
              {!student.progress?.length && <p className="muted">暂未记录进步点。</p>}
            </div>
          </section>

          <section className="record-list">
            <div className="section-heading">
              <h3>每日反馈</h3>
              <span>由老师每日录入</span>
            </div>
            {feedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                student={student}
                copyText={copyText}
                showStudent={false}
              />
            ))}
          </section>
        </>
      ) : null}
    </div>
  )
}

function TeacherView({
  students,
  feedbacks,
  teacherAuthed,
  teacherPassword,
  setTeacherPassword,
  onLogin,
  teacherMessage,
  studentForm,
  setStudentForm,
  onAddStudent,
  feedbackForm,
  setFeedbackForm,
  onAddFeedback,
  selectedStudent,
  progressText,
  setProgressText,
  onAddProgress,
  copyText,
  totalThisWeek,
}) {
  if (!teacherAuthed) {
    return (
      <div className="screen-content">
        <form className="panel login-panel" onSubmit={onLogin}>
          <div className="lock-badge">
            <KeyRound size={24} />
          </div>
          <h2>老师后台</h2>
          <p>输入后台密码后，可管理学生和每日反馈。</p>
          <label htmlFor="teacherPassword">后台密码</label>
          <input
            id="teacherPassword"
            type="password"
            value={teacherPassword}
            onChange={(event) => setTeacherPassword(event.target.value)}
            placeholder="请输入老师后台密码"
          />
          <button className="primary-button" type="submit">
            <LockKeyhole size={18} />
            进入后台
          </button>
          <p className="hint">测试密码：zqt2026</p>
          {teacherMessage && <p className="form-message">{teacherMessage}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="screen-content">
      {teacherMessage && <div className="notice">{teacherMessage}</div>}

      <section className="stats-grid">
        <StatCard icon={<UsersRound size={18} />} label="学生数" value={`${students.length} 人`} />
        <StatCard icon={<CalendarDays size={18} />} label="本周反馈" value={`${totalThisWeek} 条`} />
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <Plus size={18} />
            <h3>添加学生</h3>
          </div>
        </div>
        <form className="form-grid" onSubmit={onAddStudent}>
          <input
            value={studentForm.name}
            onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })}
            placeholder="学生姓名"
          />
          <input
            value={studentForm.className}
            onChange={(event) => setStudentForm({ ...studentForm, className: event.target.value })}
            placeholder="班级/课程"
          />
          <input
            value={studentForm.queryCode}
            onChange={(event) => setStudentForm({ ...studentForm, queryCode: event.target.value })}
            placeholder="家长查询码，如 ZQT001"
          />
          <input
            value={studentForm.parentName}
            onChange={(event) => setStudentForm({ ...studentForm, parentName: event.target.value })}
            placeholder="家长称呼，可选"
          />
          <button className="primary-button" type="submit">
            <Plus size={18} />
            保存学生
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <BookOpenCheck size={18} />
            <h3>录入每日反馈</h3>
          </div>
        </div>
        <form className="form-grid" onSubmit={onAddFeedback}>
          <select
            value={feedbackForm.studentId}
            onChange={(event) => setFeedbackForm({ ...feedbackForm, studentId: event.target.value })}
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} · {student.className}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={feedbackForm.date}
            onChange={(event) => setFeedbackForm({ ...feedbackForm, date: event.target.value })}
          />
          <input
            value={feedbackForm.homework}
            onChange={(event) => setFeedbackForm({ ...feedbackForm, homework: event.target.value })}
            placeholder="作业完成情况"
          />
          <label className="range-label">
            专注表现：{feedbackForm.focus}/5
            <input
              type="range"
              min="1"
              max="5"
              value={feedbackForm.focus}
              onChange={(event) => setFeedbackForm({ ...feedbackForm, focus: event.target.value })}
            />
          </label>
          <textarea
            value={feedbackForm.mistakes}
            onChange={(event) => setFeedbackForm({ ...feedbackForm, mistakes: event.target.value })}
            placeholder="错题情况"
          />
          <textarea
            value={feedbackForm.evaluation}
            onChange={(event) => setFeedbackForm({ ...feedbackForm, evaluation: event.target.value })}
            placeholder="老师评价"
          />
          <textarea
            value={feedbackForm.reminder}
            onChange={(event) => setFeedbackForm({ ...feedbackForm, reminder: event.target.value })}
            placeholder="老师提醒"
          />
          <button className="primary-button" type="submit">
            <CheckCircle2 size={18} />
            保存反馈
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <Lightbulb size={18} />
            <h3>孩子进步记录</h3>
          </div>
        </div>
        <form className="form-grid" onSubmit={onAddProgress}>
          <select
            value={feedbackForm.studentId}
            onChange={(event) => setFeedbackForm({ ...feedbackForm, studentId: event.target.value })}
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          <textarea
            value={progressText}
            onChange={(event) => setProgressText(event.target.value)}
            placeholder="记录孩子今天值得肯定的进步"
          />
          <button className="primary-button" type="submit">
            <Sparkles size={18} />
            保存进步
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <UsersRound size={18} />
            <h3>全部学生</h3>
          </div>
        </div>
        <div className="student-list">
          {students.map((student) => (
            <article key={student.id} className="student-row">
              <div className="avatar small">{student.name.slice(0, 1)}</div>
              <div>
                <strong>{student.name}</strong>
                <span>{student.className}</span>
                <code>{student.queryCode}</code>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="record-list">
        <div className="section-heading">
          <h3>全部反馈</h3>
          <span>老师可查看所有学生记录</span>
        </div>
        {sortByDateDesc(feedbacks).map((feedback) => {
          const student = students.find((item) => item.id === feedback.studentId)
          return student ? (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              student={student}
              copyText={copyText}
              showStudent
            />
          ) : null
        })}
      </section>
    </div>
  )
}

function FeedbackCard({ feedback, student, copyText, showStudent }) {
  return (
    <article className="feedback-card">
      <div className="feedback-head">
        <div>
          <time>{feedback.date}</time>
          {showStudent && <strong>{student.name}</strong>}
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label="复制家长反馈文案"
          title="复制家长反馈文案"
          onClick={() => copyText(buildFeedbackText(student, feedback), '家长反馈文案')}
        >
          <Clipboard size={17} />
        </button>
      </div>

      <div className="feedback-line">
        <span>作业完成</span>
        <p>{feedback.homework}</p>
      </div>
      <div className="feedback-line">
        <span>专注表现</span>
        <p>
          {focusText(Number(feedback.focus))} · {feedback.focus}/5
        </p>
      </div>
      <div className="feedback-line">
        <span>错题情况</span>
        <p>{feedback.mistakes}</p>
      </div>
      <div className="feedback-line">
        <span>老师评价</span>
        <p>{feedback.evaluation}</p>
      </div>
      <div className="feedback-line">
        <span>老师提醒</span>
        <p>{feedback.reminder}</p>
      </div>
    </article>
  )
}

export default App
