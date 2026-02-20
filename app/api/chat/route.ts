import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
} from 'ai'
import { z } from 'zod'
import {
  availableCourses,
  studentProfile,
  calendarEvents,
  courseReviews,
  getRemainingRequirements,
  checkScheduleConflict,
  meetsPrerequisites,
  getAverageRating,
} from '@/lib/data'

export const maxDuration = 30

const systemPrompt = `You are CourseFlow, an AI course scheduling assistant for university students. You help students plan their course schedules by understanding their degree requirements, checking for conflicts, and providing insights from course reviews.

## Student Profile
- Name: ${studentProfile.name}
- Year: ${studentProfile.year}
- Major(s): ${studentProfile.majors.join(', ')}
- Minor(s): ${studentProfile.minors.join(', ')}
- GPA: ${studentProfile.gpa}
- Credits Completed: ${studentProfile.totalCredits}/${studentProfile.requiredCredits}
- Current Courses: ${studentProfile.currentCourses.map(c => c.code + ' - ' + c.name).join(', ')}

## Completed Courses
${studentProfile.completedCourses.map(c => `- ${c.code}: ${c.name} (${c.grade})`).join('\n')}

## Guidelines
- Always check prerequisites before recommending a course.
- When suggesting courses, proactively check for calendar conflicts with their existing commitments.
- When the student asks about a course, proactively look up reviews so they have peer feedback.
- Be conversational and friendly - you're talking to college students.
- Give concrete, actionable advice about which courses to take and when.
- Consider workload balance when suggesting multiple courses together.
- If a course is nearly full, mention that urgency.
- Use the tools available to you to look up specific information rather than guessing.
- When presenting course info, format it nicely with the key details.
- Keep responses concise but thorough.`

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(8),
    tools: {
      searchCourses: tool({
        description: 'Search for available courses by department, name, code, or tag. Use this to find courses the student might be interested in.',
        inputSchema: z.object({
          query: z.string().describe('Search query - can be course code, name, department, or tag like "elective", "project-heavy", etc.'),
        }),
        execute: async ({ query }) => {
          const q = query.toLowerCase()
          const results = availableCourses.filter(c =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.department.toLowerCase().includes(q) ||
            c.tags.some(t => t.toLowerCase().includes(q)) ||
            c.instructor.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
          )
          return results.map(c => ({
            code: c.code,
            name: c.name,
            credits: c.credits,
            instructor: c.instructor,
            schedule: c.schedule.map(s => `${s.days.join('/')} ${s.startTime}-${s.endTime}`).join(', '),
            enrolled: `${c.enrolled}/${c.capacity}`,
            prerequisites: c.prerequisites.length > 0 ? c.prerequisites.join(', ') : 'None',
            tags: c.tags,
            description: c.description,
          }))
        },
      }),

      getRequirements: tool({
        description: 'Get the remaining degree requirements for the student. Shows what core courses and electives they still need.',
        inputSchema: z.object({}),
        execute: async () => {
          const reqs = getRemainingRequirements()
          return {
            remainingCoreCourses: reqs.remainingCore.map(c => `${c.code}: ${c.name} (${c.credits} cr)`),
            electivesNeeded: reqs.remainingElectivesNeeded,
            electiveOptions: reqs.electiveOptions.map(c => `${c.code}: ${c.name} (${c.credits} cr)`),
            completedCoreCount: reqs.completedCore.length,
            totalCoreRequired: reqs.completedCore.length + reqs.remainingCore.length,
          }
        },
      }),

      checkConflicts: tool({
        description: 'Check if a course schedule conflicts with the student\'s existing calendar (work, clubs, gym, etc). Always use this before recommending a specific course.',
        inputSchema: z.object({
          courseCode: z.string().describe('The course code to check, e.g. "CS 370"'),
        }),
        execute: async ({ courseCode }) => {
          const course = availableCourses.find(c => c.code === courseCode)
          if (!course) return { error: `Course ${courseCode} not found.` }

          const allConflicts = course.schedule.flatMap(sched =>
            checkScheduleConflict(sched.days, sched.startTime, sched.endTime, calendarEvents)
          )

          return {
            courseCode: course.code,
            courseName: course.name,
            courseSchedule: course.schedule.map(s => `${s.days.join('/')} ${s.startTime}-${s.endTime}`),
            hasConflicts: allConflicts.length > 0,
            conflicts: allConflicts.map(e => ({
              event: e.title,
              day: e.day,
              time: `${e.startTime}-${e.endTime}`,
              type: e.type,
            })),
            calendarNote: allConflicts.length > 0
              ? `This course conflicts with ${allConflicts.length} event(s) on the student's calendar.`
              : 'No conflicts found with existing calendar events.',
          }
        },
      }),

      checkPrerequisites: tool({
        description: 'Check if the student meets the prerequisites for a specific course.',
        inputSchema: z.object({
          courseCode: z.string().describe('The course code to check prerequisites for'),
        }),
        execute: async ({ courseCode }) => {
          const result = meetsPrerequisites(courseCode)
          const course = availableCourses.find(c => c.code === courseCode)
          return {
            courseCode,
            courseName: course?.name || 'Unknown',
            prerequisitesMet: result.met,
            missingPrerequisites: result.missing,
            allPrerequisites: course?.prerequisites || [],
            note: result.met
              ? 'The student meets all prerequisites for this course.'
              : `The student is missing: ${result.missing.join(', ')}. They cannot enroll until these are completed.`,
          }
        },
      }),

      getCourseReviews: tool({
        description: 'Get student reviews and feedback for a specific course. Use this when the student asks about a course, wants to know about teaching style, difficulty, or what other students thought.',
        inputSchema: z.object({
          courseCode: z.string().describe('The course code to get reviews for, e.g. "CS 410"'),
        }),
        execute: async ({ courseCode }) => {
          const reviews = courseReviews.filter(r => r.courseCode === courseCode)
          const avgRating = getAverageRating(courseCode)
          const course = availableCourses.find(c => c.code === courseCode)

          if (reviews.length === 0) {
            return { courseCode, message: 'No reviews found for this course.' }
          }

          return {
            courseCode,
            courseName: course?.name || 'Unknown',
            averageRating: avgRating.toFixed(1),
            totalReviews: reviews.length,
            reviews: reviews.map(r => ({
              rating: `${r.rating}/5`,
              difficulty: `${r.difficulty}/5`,
              workload: r.workload,
              teachingStyle: r.teachingStyle,
              comment: r.comment,
              grade: r.grade,
              semester: r.semester,
              upvotes: r.upvotes,
            })),
          }
        },
      }),

      getCalendar: tool({
        description: 'Get the student\'s current calendar with all their recurring commitments (work, clubs, gym, study groups, etc).',
        inputSchema: z.object({}),
        execute: async () => {
          const byDay: Record<string, typeof calendarEvents> = {}
          for (const event of calendarEvents) {
            if (!byDay[event.day]) byDay[event.day] = []
            byDay[event.day].push(event)
          }

          return {
            events: Object.entries(byDay).map(([day, events]) => ({
              day,
              events: events.map(e => ({
                title: e.title,
                time: `${e.startTime}-${e.endTime}`,
                type: e.type,
              })),
            })),
            note: 'These are recurring weekly commitments from the student\'s Google Calendar.',
          }
        },
      }),

      buildSchedule: tool({
        description: 'Generate a visual weekly schedule with selected courses and existing calendar events to show the student their potential week. Use this when the student wants to see what their schedule would look like with certain courses.',
        inputSchema: z.object({
          courseCodes: z.array(z.string()).describe('Array of course codes to include in the schedule'),
        }),
        execute: async ({ courseCodes }) => {
          const courses = courseCodes
            .map(code => availableCourses.find(c => c.code === code))
            .filter(Boolean)

          const schedule: Record<string, Array<{ title: string; start: string; end: string; type: string }>> = {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [],
          }

          // Add calendar events
          for (const event of calendarEvents) {
            if (schedule[event.day]) {
              schedule[event.day].push({
                title: event.title,
                start: event.startTime,
                end: event.endTime,
                type: event.type,
              })
            }
          }

          // Add courses
          for (const course of courses) {
            if (!course) continue
            for (const sched of course.schedule) {
              for (const day of sched.days) {
                if (schedule[day]) {
                  schedule[day].push({
                    title: `${course.code}: ${course.name}`,
                    start: sched.startTime,
                    end: sched.endTime,
                    type: 'course',
                  })
                }
              }
            }
          }

          // Sort each day by start time
          for (const day of Object.keys(schedule)) {
            schedule[day].sort((a, b) => a.start.localeCompare(b.start))
          }

          // Check for any conflicts
          const conflicts: string[] = []
          for (const course of courses) {
            if (!course) continue
            for (const sched of course.schedule) {
              const courseConflicts = checkScheduleConflict(sched.days, sched.startTime, sched.endTime, calendarEvents)
              if (courseConflicts.length > 0) {
                conflicts.push(`${course.code} conflicts with ${courseConflicts.map(c => c.title).join(', ')}`)
              }
            }
          }

          // Check course-to-course conflicts
          for (let i = 0; i < courses.length; i++) {
            for (let j = i + 1; j < courses.length; j++) {
              const c1 = courses[i]
              const c2 = courses[j]
              if (!c1 || !c2) continue
              for (const s1 of c1.schedule) {
                for (const s2 of c2.schedule) {
                  const dayOverlap = s1.days.some(d => s2.days.includes(d))
                  if (dayOverlap) {
                    const s1Start = parseInt(s1.startTime.replace(':', ''))
                    const s1End = parseInt(s1.endTime.replace(':', ''))
                    const s2Start = parseInt(s2.startTime.replace(':', ''))
                    const s2End = parseInt(s2.endTime.replace(':', ''))
                    if (s1Start < s2End && s1End > s2Start) {
                      conflicts.push(`${c1.code} and ${c2.code} have overlapping times`)
                    }
                  }
                }
              }
            }
          }

          const totalCredits = courses.reduce((sum, c) => sum + (c?.credits || 0), 0)
            + studentProfile.currentCourses.reduce((sum, c) => sum + c.credits, 0)

          return {
            schedule,
            selectedCourses: courses.map(c => c ? `${c.code}: ${c.name} (${c.credits} cr)` : ''),
            totalCreditsThisSemester: totalCredits,
            conflicts: conflicts.length > 0 ? conflicts : ['No conflicts detected!'],
            note: `This schedule includes ${courses.length} new course(s) plus existing calendar commitments.`,
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
