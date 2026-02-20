'use client'

import { useState, useMemo } from 'react'
import {
  Star,
  ThumbsUp,
  TrendingUp,
  BookOpen,
  BarChart3,
  MessageSquare,
  ChevronDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { courseReviews, availableCourses, getAverageRating, getReviewsForCourse } from '@/lib/data'

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5
  const starSize = size === 'sm' ? 'size-3' : 'size-4'

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < fullStars
              ? 'fill-chart-4 text-chart-4'
              : i === fullStars && hasHalf
              ? 'fill-chart-4/50 text-chart-4'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  )
}

function DifficultyBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Difficulty ${level} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full ${
            i < level
              ? level >= 4
                ? 'bg-destructive'
                : level >= 3
                ? 'bg-chart-3'
                : 'bg-accent'
              : 'bg-muted'
          }`}
        />
      ))}
    </div>
  )
}

type SortOption = 'recent' | 'rating' | 'upvotes' | 'difficulty'

export function CourseReviewsPanel() {
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('upvotes')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Get unique courses with reviews
  const coursesWithReviews = useMemo(() => {
    const codes = new Set(courseReviews.map(r => r.courseCode))
    return Array.from(codes).map(code => {
      const course = availableCourses.find(c => c.code === code)
      return {
        code,
        name: course?.name || 'Unknown',
        avgRating: getAverageRating(code),
        reviewCount: getReviewsForCourse(code).length,
      }
    }).sort((a, b) => b.avgRating - a.avgRating)
  }, [])

  const filteredReviews = useMemo(() => {
    let reviews = selectedCourse === 'all'
      ? [...courseReviews]
      : courseReviews.filter(r => r.courseCode === selectedCourse)

    switch (sortBy) {
      case 'recent':
        return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      case 'rating':
        return reviews.sort((a, b) => b.rating - a.rating)
      case 'upvotes':
        return reviews.sort((a, b) => b.upvotes - a.upvotes)
      case 'difficulty':
        return reviews.sort((a, b) => b.difficulty - a.difficulty)
      default:
        return reviews
    }
  }, [selectedCourse, sortBy])

  // Calculate overview stats
  const overviewStats = useMemo(() => {
    const reviews = selectedCourse === 'all'
      ? courseReviews
      : courseReviews.filter(r => r.courseCode === selectedCourse)

    if (reviews.length === 0) return null

    return {
      avgRating: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
      avgDifficulty: (reviews.reduce((s, r) => s + r.difficulty, 0) / reviews.length).toFixed(1),
      totalReviews: reviews.length,
      topWorkload: reviews.reduce((acc, r) => {
        const key = r.workload.split(' - ')[0] || r.workload.split(' ')[0]
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }
  }, [selectedCourse])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Course Selector */}
      <div className="border-b border-border/50 px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCourse('all')}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCourse === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All Courses
            </button>
            {coursesWithReviews.map(c => (
              <button
                key={c.code}
                onClick={() => setSelectedCourse(c.code)}
                className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCourse === c.code
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{c.code}</span>
                <span className="flex items-center gap-0.5">
                  <Star className="size-2.5 fill-current" />
                  {c.avgRating.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-4">
          {/* Stats Overview */}
          {overviewStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="rounded-xl border border-border/50 bg-card p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Star className="size-3.5 text-chart-4" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Avg Rating</span>
                </div>
                <p className="text-xl font-bold text-card-foreground">{overviewStats.avgRating}<span className="text-xs text-muted-foreground font-normal">/5</span></p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="size-3.5 text-destructive" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Difficulty</span>
                </div>
                <p className="text-xl font-bold text-card-foreground">{overviewStats.avgDifficulty}<span className="text-xs text-muted-foreground font-normal">/5</span></p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <MessageSquare className="size-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Reviews</span>
                </div>
                <p className="text-xl font-bold text-card-foreground">{overviewStats.totalReviews}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen className="size-3.5 text-accent" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Courses</span>
                </div>
                <p className="text-xl font-bold text-card-foreground">
                  {selectedCourse === 'all' ? coursesWithReviews.length : 1}
                </p>
              </div>
            </div>
          )}

          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {selectedCourse === 'all' ? 'All Student Reviews' : `Reviews for ${selectedCourse}`}
            </h2>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <BarChart3 className="size-3" />
                Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                <ChevronDown className="size-3" />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 rounded-lg border border-border bg-popover shadow-md">
                    {(['upvotes', 'recent', 'rating', 'difficulty'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setDropdownOpen(false) }}
                        className={`block w-full px-4 py-2 text-left text-xs hover:bg-accent/10 transition-colors ${
                          sortBy === opt ? 'text-primary font-medium' : 'text-popover-foreground'
                        }`}
                      >
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="flex flex-col gap-3">
            {filteredReviews.map(review => {
              const course = availableCourses.find(c => c.code === review.courseCode)
              return (
                <article
                  key={review.id}
                  className="rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      {selectedCourse === 'all' && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-semibold text-primary">{review.courseCode}</span>
                          <span className="text-xs text-muted-foreground">{course?.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-muted-foreground">{review.semester}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className="text-[10px] border-border">
                        Grade: {review.grade}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ThumbsUp className="size-3" />
                        <span className="text-xs">{review.upvotes}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Difficulty</span>
                      <DifficultyBar level={review.difficulty} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Workload: {review.workload}
                    </span>
                  </div>

                  <div className="mb-3 rounded-lg bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Teaching Style</p>
                    <p className="text-xs text-card-foreground leading-relaxed">{review.teachingStyle}</p>
                  </div>

                  <p className="text-sm text-card-foreground leading-relaxed">{review.comment}</p>
                </article>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
