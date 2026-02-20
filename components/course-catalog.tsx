'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Clock,
  Users,
  BookOpen,
  Star,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  availableCourses,
  meetsPrerequisites,
  getAverageRating,
  getReviewsForCourse,
  checkScheduleConflict,
  calendarEvents,
} from '@/lib/data'

const tagColors: Record<string, string> = {
  core: 'bg-primary/15 text-primary border-primary/20',
  elective: 'bg-accent/15 text-accent border-accent/20',
  'project-heavy': 'bg-chart-3/15 text-chart-3 border-chart-3/20',
  'exam-heavy': 'bg-destructive/15 text-destructive border-destructive/20',
  'math-heavy': 'bg-chart-5/15 text-chart-5 border-chart-5/20',
  popular: 'bg-chart-4/15 text-chart-4 border-chart-4/20',
  'hands-on': 'bg-accent/15 text-accent border-accent/20',
  'lab-heavy': 'bg-chart-2/15 text-chart-2 border-chart-2/20',
  'theory-heavy': 'bg-chart-1/15 text-chart-1 border-chart-1/20',
  'industry-relevant': 'bg-accent/15 text-accent border-accent/20',
  'beginner-friendly': 'bg-accent/15 text-accent border-accent/20',
  advanced: 'bg-destructive/15 text-destructive border-destructive/20',
  challenging: 'bg-destructive/15 text-destructive border-destructive/20',
  creative: 'bg-chart-4/15 text-chart-4 border-chart-4/20',
  'senior-only': 'bg-chart-3/15 text-chart-3 border-chart-3/20',
  'no-prereqs': 'bg-accent/15 text-accent border-accent/20',
  'writing-intensive': 'bg-chart-5/15 text-chart-5 border-chart-5/20',
  'math-minor': 'bg-chart-1/15 text-chart-1 border-chart-1/20',
  applied: 'bg-chart-2/15 text-chart-2 border-chart-2/20',
  'general-ed': 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/20',
  humanities: 'bg-chart-4/15 text-chart-4 border-chart-4/20',
}

type FilterOption = 'all' | 'eligible' | 'cs' | 'math' | 'other'

export function CourseCatalog() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  const filteredCourses = useMemo(() => {
    let courses = availableCourses

    if (search) {
      const q = search.toLowerCase()
      courses = courses.filter(
        c =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.tags.some(t => t.includes(q))
      )
    }

    if (filter === 'eligible') {
      courses = courses.filter(c => meetsPrerequisites(c.code).met)
    } else if (filter === 'cs') {
      courses = courses.filter(c => c.department === 'Computer Science')
    } else if (filter === 'math') {
      courses = courses.filter(c => c.department === 'Mathematics')
    } else if (filter === 'other') {
      courses = courses.filter(c => c.department !== 'Computer Science' && c.department !== 'Mathematics')
    }

    return courses
  }, [search, filter])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search and Filters */}
      <div className="border-b border-border/50 px-4 py-3">
        <div className="mx-auto max-w-4xl flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by name, code, instructor, or tag..."
              className="w-full rounded-lg border border-border/50 bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
              aria-label="Search courses"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            {[
              { id: 'all' as const, label: 'All Courses' },
              { id: 'eligible' as const, label: 'Eligible' },
              { id: 'cs' as const, label: 'CS' },
              { id: 'math' as const, label: 'Math' },
              { id: 'other' as const, label: 'Other' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  filter === f.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">
              {filteredCourses.length} courses
            </span>
          </div>
        </div>
      </div>

      {/* Course List */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-4 flex flex-col gap-3">
          {filteredCourses.map(course => {
            const prereqs = meetsPrerequisites(course.code)
            const avgRating = getAverageRating(course.code)
            const reviewCount = getReviewsForCourse(course.code).length
            const isExpanded = expandedCourse === course.id
            const capacityPercent = Math.round((course.enrolled / course.capacity) * 100)
            const isAlmostFull = capacityPercent >= 85

            // Check schedule conflicts
            const conflicts = course.schedule.flatMap(s =>
              checkScheduleConflict(s.days, s.startTime, s.endTime, calendarEvents)
            )

            return (
              <div
                key={course.id}
                className="rounded-xl border border-border/50 bg-card overflow-hidden transition-all hover:border-border hover:shadow-sm"
              >
                <button
                  onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                  className="w-full text-left p-4"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold text-primary">{course.code}</span>
                        {!prereqs.met && (
                          <span className="flex items-center gap-1 text-[10px] text-destructive">
                            <XCircle className="size-3" />
                            <span className="hidden sm:inline">Prerequisites not met</span>
                          </span>
                        )}
                        {prereqs.met && (
                          <span className="flex items-center gap-1 text-[10px] text-accent">
                            <CheckCircle2 className="size-3" />
                            <span className="hidden sm:inline">Eligible</span>
                          </span>
                        )}
                        {conflicts.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-chart-3">
                            <AlertTriangle className="size-3" />
                            <span className="hidden sm:inline">Schedule conflict</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-card-foreground">{course.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {avgRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="size-3 fill-chart-4 text-chart-4" />
                          <span className="text-xs font-semibold text-card-foreground">{avgRating.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-card-foreground">{course.credits} credits</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {course.schedule.map(s => `${s.days.map(d => d.slice(0, 3)).join('/')} ${s.startTime}-${s.endTime}`).join(', ')}
                    </span>
                    <span className={`flex items-center gap-1 ${isAlmostFull ? 'text-destructive font-medium' : ''}`}>
                      <Users className="size-3" />
                      {course.enrolled}/{course.capacity}
                      {isAlmostFull && ' (Almost full!)'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {course.tags.map(tag => (
                      <span
                        key={tag}
                        className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${tagColors[tag] || 'bg-muted text-muted-foreground border-border'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border/50 px-4 py-3 bg-muted/20">
                    <p className="text-xs text-card-foreground leading-relaxed mb-3">{course.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Prerequisites: </span>
                        <span className="text-card-foreground font-medium">
                          {course.prerequisites.length > 0 ? course.prerequisites.join(', ') : 'None'}
                        </span>
                      </div>
                      {!prereqs.met && prereqs.missing.length > 0 && (
                        <div className="text-destructive">
                          Missing: {prereqs.missing.join(', ')}
                        </div>
                      )}
                      {conflicts.length > 0 && (
                        <div className="text-chart-3">
                          Conflicts with: {conflicts.map(c => c.title).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
