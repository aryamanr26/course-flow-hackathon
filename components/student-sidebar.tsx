'use client'

import { useState } from 'react'
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  Dumbbell,
  BookMarked,
  Heart,
  ChevronDown,
  ChevronRight,
  X,
  Award,
  Star,
  Gem,
  Trophy,
  Shield,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { studentProfile, getRemainingRequirements, getStudentSkills, type BadgeTier } from '@/lib/data'
import { useCalendar } from '@/lib/calendar-store'
import { CalendarUpload } from '@/components/calendar-upload'

const eventTypeIcons: Record<string, React.ReactNode> = {
  work: <Briefcase className="size-3.5" />,
  club: <Users className="size-3.5" />,
  personal: <Dumbbell className="size-3.5" />,
  study: <BookMarked className="size-3.5" />,
}

const eventTypeColors: Record<string, string> = {
  work: 'bg-chart-3/20 text-chart-3',
  club: 'bg-chart-1/20 text-chart-1',
  personal: 'bg-accent/20 text-accent',
  study: 'bg-chart-5/20 text-chart-5',
}

const tierConfig: Record<BadgeTier, { label: string; colors: string; bg: string; icon: React.ReactNode }> = {
  platinum: {
    label: 'Platinum',
    colors: 'text-[#a8e6f0] border-[#a8e6f0]/40',
    bg: 'bg-[#a8e6f0]/10',
    icon: <Gem className="size-3" />,
  },
  gold: {
    label: 'Gold',
    colors: 'text-[#f0c850] border-[#f0c850]/40',
    bg: 'bg-[#f0c850]/10',
    icon: <Trophy className="size-3" />,
  },
  silver: {
    label: 'Silver',
    colors: 'text-[#c0c0c0] border-[#c0c0c0]/40',
    bg: 'bg-[#c0c0c0]/10',
    icon: <Star className="size-3" />,
  },
  bronze: {
    label: 'Bronze',
    colors: 'text-[#cd7f32] border-[#cd7f32]/40',
    bg: 'bg-[#cd7f32]/10',
    icon: <Shield className="size-3" />,
  },
}

export function StudentSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile', 'progress']))
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const skills = getStudentSkills()
  const requirements = getRemainingRequirements()
  const progressPercent = Math.round((studentProfile.totalCredits / studentProfile.requiredCredits) * 100)
  const { events, importEvents } = useCalendar()

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const SectionHeader = ({ id, label, icon }: { id: string; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => toggleSection(id)}
      className="flex w-full items-center gap-2 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {expandedSections.has(id) ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
    </button>
  )

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 lg:relative lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GraduationCap className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-sidebar-foreground">CourseFlow</h2>
              <p className="text-[10px] text-sidebar-foreground/50">AI Scheduling Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent">
            <X className="size-4" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>

        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-4 flex flex-col gap-1">
            {/* Student Profile */}
            <SectionHeader id="profile" label="Student Profile" icon={<GraduationCap className="size-3.5" />} />
            {expandedSections.has('profile') && (
              <div className="mb-3 rounded-lg bg-sidebar-accent/50 p-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
                    {studentProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-sidebar-foreground">{studentProfile.name}</p>
                    <p className="text-xs text-sidebar-foreground/60">{studentProfile.year} &middot; GPA {studentProfile.gpa}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {studentProfile.majors.map(m => (
                    <Badge key={m} className="bg-sidebar-primary/20 text-sidebar-primary text-[10px] border-0">{m}</Badge>
                  ))}
                  {studentProfile.minors.map(m => (
                    <Badge key={m} variant="outline" className="text-[10px] border-sidebar-border text-sidebar-foreground/70">{m} Minor</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Badges */}
            <SectionHeader id="skills" label="Acquired Skills" icon={<Award className="size-3.5" />} />
            {expandedSections.has('skills') && (
              <div className="mb-3 rounded-lg bg-sidebar-accent/50 p-3">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] text-sidebar-foreground/50">{skills.length} skills earned from {studentProfile.completedCourses.length + studentProfile.currentCourses.length} courses</p>
                </div>
                {/* Tier legend */}
                <div className="flex flex-wrap gap-1.5 mb-3 pb-2.5 border-b border-sidebar-border/50">
                  {(['platinum', 'gold', 'silver', 'bronze'] as BadgeTier[]).map(tier => {
                    const count = skills.filter(s => s.tier === tier).length
                    if (count === 0) return null
                    return (
                      <div key={tier} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium border ${tierConfig[tier].colors} ${tierConfig[tier].bg}`}>
                        {tierConfig[tier].icon}
                        <span>{tierConfig[tier].label}</span>
                        <span className="opacity-60">{count}</span>
                      </div>
                    )
                  })}
                </div>
                {/* Skills list */}
                <div className="flex flex-col gap-1">
                  {skills.map(badge => {
                    const config = tierConfig[badge.tier]
                    const isExpanded = expandedSkill === badge.skill
                    return (
                      <div key={badge.skill}>
                        <button
                          onClick={() => setExpandedSkill(isExpanded ? null : badge.skill)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent ${isExpanded ? 'bg-sidebar-accent' : ''}`}
                        >
                          <span className={`flex size-5 shrink-0 items-center justify-center rounded ${config.bg} ${config.colors}`}>
                            {config.icon}
                          </span>
                          <span className="flex-1 text-[11px] font-medium text-sidebar-foreground truncate">{badge.skill}</span>
                          <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full border ${config.colors} ${config.bg}`}>
                            {badge.courseCount}x
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="ml-7 mt-1 mb-1.5 flex flex-col gap-0.5">
                            {badge.courses.map(code => (
                              <span key={code} className="text-[10px] text-sidebar-foreground/50 pl-2 border-l border-sidebar-border">
                                {code}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Degree Progress */}
            <SectionHeader id="progress" label="Degree Progress" icon={<BookOpen className="size-3.5" />} />
            {expandedSections.has('progress') && (
              <div className="mb-3 rounded-lg bg-sidebar-accent/50 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-sidebar-foreground/70">Credits</span>
                  <span className="text-xs font-mono font-semibold text-sidebar-foreground">
                    {studentProfile.totalCredits}/{studentProfile.requiredCredits}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2 mb-2" />
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-md bg-sidebar-accent p-2">
                    <p className="text-sidebar-foreground/50">Core Left</p>
                    <p className="font-semibold text-sidebar-foreground">{requirements.remainingCore.length} courses</p>
                  </div>
                  <div className="rounded-md bg-sidebar-accent p-2">
                    <p className="text-sidebar-foreground/50">Electives Left</p>
                    <p className="font-semibold text-sidebar-foreground">{requirements.remainingElectivesNeeded} courses</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Courses */}
            <SectionHeader id="current" label="Current Semester" icon={<Clock className="size-3.5" />} />
            {expandedSections.has('current') && (
              <div className="mb-3 flex flex-col gap-1.5">
                {studentProfile.currentCourses.map(c => (
                  <div key={c.code} className="flex items-center gap-2 rounded-md bg-sidebar-accent/50 px-3 py-2">
                    <CheckCircle2 className="size-3.5 text-accent" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-sidebar-foreground truncate">{c.code}</p>
                      <p className="text-[10px] text-sidebar-foreground/50 truncate">{c.name}</p>
                    </div>
                    <span className="text-[10px] text-sidebar-foreground/40">{c.credits}cr</span>
                  </div>
                ))}
              </div>
            )}

            {/* Calendar */}
            <SectionHeader id="calendar" label="Weekly Calendar" icon={<Calendar className="size-3.5" />} />
            {expandedSections.has('calendar') && (
              <div className="mb-3 flex flex-col gap-2">
                <CalendarUpload onImport={importEvents} />
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                  const dayEvents = events.filter(e => e.day === day)
                  if (dayEvents.length === 0) return null
                  return (
                    <div key={day}>
                      <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase mb-1">{day}</p>
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 mb-1 ${eventTypeColors[event.type] || 'bg-sidebar-accent text-sidebar-foreground'}`}
                        >
                          {eventTypeIcons[event.type]}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium truncate">{event.title}</p>
                          </div>
                          <span className="text-[9px] font-mono opacity-70">
                            {event.startTime}-{event.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Completed Courses */}
            <SectionHeader id="completed" label="Completed Courses" icon={<Heart className="size-3.5" />} />
            {expandedSections.has('completed') && (
              <div className="mb-3 flex flex-col gap-1">
                {studentProfile.completedCourses.map(c => (
                  <div key={c.code} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-sidebar-accent/30 transition-colors">
                    <span className="text-[10px] font-mono text-sidebar-foreground/50 w-14 shrink-0">{c.code}</span>
                    <span className="text-[10px] text-sidebar-foreground/70 flex-1 truncate">{c.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 border-sidebar-border ${
                        c.grade.startsWith('A') ? 'text-accent' : c.grade.startsWith('B') ? 'text-chart-1' : 'text-sidebar-foreground/60'
                      }`}
                    >
                      {c.grade}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
