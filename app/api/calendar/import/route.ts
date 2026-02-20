import { NextResponse } from 'next/server'

type ImportedEvent = {
  title: string
  day: string
  startTime: string
  endTime: string
  recurring: boolean
  type: 'work' | 'club' | 'personal' | 'study'
}

function parseICS(icsContent: string): ImportedEvent[] {
  const events: ImportedEvent[] = []
  const blocks = icsContent.split(/BEGIN:VEVENT/gi).slice(1)

  for (const block of blocks) {
    const lines = block.split(/\r?\n/)
    let summary = ''
    let dtstart = ''
    let dtend = ''
    let rrule = ''

    for (const line of lines) {
      if (line.startsWith('SUMMARY:')) {
        summary = line.slice('SUMMARY:'.length).trim()
      } else if (line.startsWith('DTSTART')) {
        dtstart = line.split(':')[1] ?? ''
      } else if (line.startsWith('DTEND')) {
        dtend = line.split(':')[1] ?? ''
      } else if (line.startsWith('RRULE:')) {
        rrule = line.slice('RRULE:'.length).trim()
      }
    }

    if (!summary || !dtstart || !dtend) continue

    const parseTime = (dt: string) => {
      const timePart = dt.split('T')[1]?.slice(0, 4) ?? '0000'
      const h = timePart.slice(0, 2)
      const m = timePart.slice(2, 4)
      return `${h}:${m}`
    }

    const startTime = parseTime(dtstart)
    const endTime = parseTime(dtend)

    const dayMatch = dtstart.match(/(\d{8})T/)
    let day = 'Monday'
    if (dayMatch) {
      const dateStr = dayMatch[1]
      const date = new Date(
        parseInt(dateStr.slice(0, 4)),
        parseInt(dateStr.slice(4, 6)) - 1,
        parseInt(dateStr.slice(6, 8))
      )
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      day = dayNames[date.getDay()]
    }

    const tl = summary.toLowerCase()
    let type: ImportedEvent['type'] = 'personal'
    if (tl.includes('job') || tl.includes('work') || tl.includes('shift')) type = 'work'
    else if (tl.includes('club') || tl.includes('meeting')) type = 'club'
    else if (tl.includes('study') || tl.includes('homework') || tl.includes('assignment')) type = 'study'

    events.push({
      title: summary,
      day,
      startTime,
      endTime,
      recurring: rrule.length > 0,
      type,
    })
  }

  return events
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.ics')) {
      return NextResponse.json({ error: 'File must be a .ics file' }, { status: 400 })
    }

    const text = await file.text()
    const events = parseICS(text)

    return NextResponse.json({ success: true, count: events.length, events })
  } catch (error) {
    console.error('Calendar import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import calendar' },
      { status: 500 }
    )
  }
}

