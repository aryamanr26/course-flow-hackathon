// ==========================================
// COURSE SCHEDULING AGENT - DATA LAYER
// ==========================================

export interface Course {
  id: string
  code: string
  name: string
  department: string
  credits: number
  description: string
  prerequisites: string[]
  schedule: {
    days: string[]
    startTime: string
    endTime: string
  }[]
  instructor: string
  capacity: number
  enrolled: number
  semester: string
  tags: string[]
}

export interface CourseReview {
  id: string
  courseId: string
  courseCode: string
  rating: number
  difficulty: number
  workload: string
  teachingStyle: string
  comment: string
  grade: string
  semester: string
  anonymous: boolean
  upvotes: number
  createdAt: string
}

export interface StudentProfile {
  id: string
  name: string
  email: string
  year: "Freshman" | "Sophomore" | "Junior" | "Senior"
  majors: string[]
  minors: string[]
  gpa: number
  completedCourses: {
    code: string
    name: string
    grade: string
    semester: string
    credits: number
  }[]
  currentCourses: {
    code: string
    name: string
    credits: number
  }[]
  totalCredits: number
  requiredCredits: number
}

export interface CalendarEvent {
  id: string
  title: string
  day: string
  startTime: string
  endTime: string
  recurring: boolean
  type: "work" | "club" | "personal" | "study"
}

// ==========================================
// MOCK STUDENT PROFILE
// ==========================================

export const studentProfile: StudentProfile = {
  id: "stu-001",
  name: "Alex Rivera",
  email: "arivera@stateuniv.edu",
  year: "Junior",
  majors: ["Computer Science"],
  minors: ["Mathematics"],
  gpa: 3.67,
  completedCourses: [
    { code: "CS 101", name: "Intro to Computer Science", grade: "A", semester: "Fall 2023", credits: 3 },
    { code: "CS 201", name: "Data Structures", grade: "A-", semester: "Spring 2024", credits: 3 },
    { code: "CS 210", name: "Computer Organization", grade: "B+", semester: "Spring 2024", credits: 3 },
    { code: "CS 220", name: "Discrete Mathematics", grade: "A", semester: "Fall 2023", credits: 3 },
    { code: "CS 301", name: "Algorithms", grade: "B+", semester: "Fall 2024", credits: 3 },
    { code: "MATH 151", name: "Calculus I", grade: "A", semester: "Fall 2023", credits: 4 },
    { code: "MATH 152", name: "Calculus II", grade: "A-", semester: "Spring 2024", credits: 4 },
    { code: "MATH 251", name: "Linear Algebra", grade: "B+", semester: "Fall 2024", credits: 3 },
    { code: "MATH 253", name: "Probability & Statistics", grade: "A-", semester: "Fall 2024", credits: 3 },
    { code: "ENG 101", name: "English Composition I", grade: "A", semester: "Fall 2023", credits: 3 },
    { code: "ENG 102", name: "English Composition II", grade: "B+", semester: "Spring 2024", credits: 3 },
    { code: "PHYS 201", name: "Physics I", grade: "B", semester: "Spring 2024", credits: 4 },
  ],
  currentCourses: [
    { code: "CS 350", name: "Operating Systems", credits: 3 },
    { code: "CS 360", name: "Database Systems", credits: 3 },
    { code: "MATH 310", name: "Numerical Analysis", credits: 3 },
  ],
  totalCredits: 52,
  requiredCredits: 120,
}

// ==========================================
// MOCK CALENDAR EVENTS
// ==========================================

export const calendarEvents: CalendarEvent[] = [
  { id: "cal-1", title: "Part-time Job - Coffee Shop", day: "Monday", startTime: "07:00", endTime: "10:00", recurring: true, type: "work" },
  { id: "cal-2", title: "Part-time Job - Coffee Shop", day: "Wednesday", startTime: "07:00", endTime: "10:00", recurring: true, type: "work" },
  { id: "cal-3", title: "Part-time Job - Coffee Shop", day: "Friday", startTime: "07:00", endTime: "10:00", recurring: true, type: "work" },
  { id: "cal-4", title: "ACM Club Meeting", day: "Tuesday", startTime: "17:00", endTime: "18:30", recurring: true, type: "club" },
  { id: "cal-5", title: "Gym / Workout", day: "Monday", startTime: "17:00", endTime: "18:30", recurring: true, type: "personal" },
  { id: "cal-6", title: "Gym / Workout", day: "Wednesday", startTime: "17:00", endTime: "18:30", recurring: true, type: "personal" },
  { id: "cal-7", title: "Gym / Workout", day: "Friday", startTime: "17:00", endTime: "18:30", recurring: true, type: "personal" },
  { id: "cal-8", title: "Study Group - Algorithms", day: "Thursday", startTime: "19:00", endTime: "21:00", recurring: true, type: "study" },
  { id: "cal-9", title: "Volunteer Tutoring", day: "Saturday", startTime: "10:00", endTime: "12:00", recurring: true, type: "personal" },
]

// ==========================================
// DEGREE REQUIREMENTS
// ==========================================

export const degreeRequirements = {
  "Computer Science": {
    core: [
      { code: "CS 101", name: "Intro to Computer Science", credits: 3 },
      { code: "CS 201", name: "Data Structures", credits: 3 },
      { code: "CS 210", name: "Computer Organization", credits: 3 },
      { code: "CS 220", name: "Discrete Mathematics", credits: 3 },
      { code: "CS 301", name: "Algorithms", credits: 3 },
      { code: "CS 350", name: "Operating Systems", credits: 3 },
      { code: "CS 360", name: "Database Systems", credits: 3 },
      { code: "CS 370", name: "Software Engineering", credits: 3 },
      { code: "CS 380", name: "Computer Networks", credits: 3 },
      { code: "CS 490", name: "Senior Capstone Project", credits: 3 },
    ],
    electives: {
      required: 4,
      options: [
        { code: "CS 410", name: "Machine Learning", credits: 3 },
        { code: "CS 420", name: "Artificial Intelligence", credits: 3 },
        { code: "CS 430", name: "Computer Graphics", credits: 3 },
        { code: "CS 440", name: "Cybersecurity", credits: 3 },
        { code: "CS 450", name: "Cloud Computing", credits: 3 },
        { code: "CS 460", name: "Mobile App Development", credits: 3 },
        { code: "CS 470", name: "Distributed Systems", credits: 3 },
        { code: "CS 480", name: "Compiler Design", credits: 3 },
      ],
    },
    math: [
      { code: "MATH 151", name: "Calculus I", credits: 4 },
      { code: "MATH 152", name: "Calculus II", credits: 4 },
      { code: "MATH 251", name: "Linear Algebra", credits: 3 },
      { code: "MATH 253", name: "Probability & Statistics", credits: 3 },
    ],
    general: {
      english: 2,
      science: 2,
      humanities: 2,
      socialScience: 2,
    },
  },
}

// ==========================================
// AVAILABLE COURSES (Next Semester)
// ==========================================

export const availableCourses: Course[] = [
  {
    id: "c-001",
    code: "CS 370",
    name: "Software Engineering",
    department: "Computer Science",
    credits: 3,
    description: "Software development methodologies, design patterns, testing, and project management. Team-based capstone project.",
    prerequisites: ["CS 201", "CS 301"],
    schedule: [{ days: ["Monday", "Wednesday"], startTime: "10:30", endTime: "11:45" }],
    instructor: "Dr. Sarah Chen",
    capacity: 40,
    enrolled: 35,
    semester: "Fall 2025",
    tags: ["core", "project-heavy"],
  },
  {
    id: "c-002",
    code: "CS 380",
    name: "Computer Networks",
    department: "Computer Science",
    credits: 3,
    description: "Network architectures, protocols, TCP/IP stack, routing, and network security fundamentals.",
    prerequisites: ["CS 210", "CS 350"],
    schedule: [{ days: ["Tuesday", "Thursday"], startTime: "09:00", endTime: "10:15" }],
    instructor: "Prof. James Morton",
    capacity: 45,
    enrolled: 28,
    semester: "Fall 2025",
    tags: ["core", "exam-heavy"],
  },
  {
    id: "c-003",
    code: "CS 410",
    name: "Machine Learning",
    department: "Computer Science",
    credits: 3,
    description: "Supervised and unsupervised learning, neural networks, deep learning fundamentals, and practical applications.",
    prerequisites: ["CS 301", "MATH 251", "MATH 253"],
    schedule: [{ days: ["Monday", "Wednesday", "Friday"], startTime: "13:00", endTime: "13:50" }],
    instructor: "Dr. Priya Patel",
    capacity: 35,
    enrolled: 34,
    semester: "Fall 2025",
    tags: ["elective", "math-heavy", "popular"],
  },
  {
    id: "c-004",
    code: "CS 420",
    name: "Artificial Intelligence",
    department: "Computer Science",
    credits: 3,
    description: "Search algorithms, knowledge representation, planning, natural language processing, and AI ethics.",
    prerequisites: ["CS 301", "MATH 253"],
    schedule: [{ days: ["Tuesday", "Thursday"], startTime: "14:00", endTime: "15:15" }],
    instructor: "Dr. Michael Torres",
    capacity: 40,
    enrolled: 32,
    semester: "Fall 2025",
    tags: ["elective", "project-heavy"],
  },
  {
    id: "c-005",
    code: "CS 440",
    name: "Cybersecurity",
    department: "Computer Science",
    credits: 3,
    description: "Cryptography, network security, ethical hacking, vulnerability analysis, and security policy.",
    prerequisites: ["CS 380"],
    schedule: [{ days: ["Monday", "Wednesday"], startTime: "15:30", endTime: "16:45" }],
    instructor: "Prof. Lisa Nakamura",
    capacity: 30,
    enrolled: 18,
    semester: "Fall 2025",
    tags: ["elective", "lab-heavy", "hands-on"],
  },
  {
    id: "c-006",
    code: "CS 450",
    name: "Cloud Computing",
    department: "Computer Science",
    credits: 3,
    description: "Cloud architectures, containerization, microservices, serverless computing, and DevOps practices.",
    prerequisites: ["CS 350"],
    schedule: [{ days: ["Tuesday", "Thursday"], startTime: "11:00", endTime: "12:15" }],
    instructor: "Dr. Kevin Wright",
    capacity: 35,
    enrolled: 29,
    semester: "Fall 2025",
    tags: ["elective", "hands-on", "industry-relevant"],
  },
  {
    id: "c-007",
    code: "CS 460",
    name: "Mobile App Development",
    department: "Computer Science",
    credits: 3,
    description: "iOS and Android development, cross-platform frameworks, UI/UX for mobile, app deployment.",
    prerequisites: ["CS 201"],
    schedule: [{ days: ["Monday", "Wednesday"], startTime: "09:00", endTime: "10:15" }],
    instructor: "Prof. Rachel Kim",
    capacity: 30,
    enrolled: 27,
    semester: "Fall 2025",
    tags: ["elective", "project-heavy", "beginner-friendly"],
  },
  {
    id: "c-008",
    code: "CS 470",
    name: "Distributed Systems",
    department: "Computer Science",
    credits: 3,
    description: "Distributed algorithms, consensus protocols, fault tolerance, MapReduce, and distributed databases.",
    prerequisites: ["CS 350", "CS 380"],
    schedule: [{ days: ["Tuesday", "Thursday"], startTime: "15:30", endTime: "16:45" }],
    instructor: "Dr. Sarah Chen",
    capacity: 30,
    enrolled: 15,
    semester: "Fall 2025",
    tags: ["elective", "theory-heavy", "advanced"],
  },
  {
    id: "c-009",
    code: "CS 490",
    name: "Senior Capstone Project",
    department: "Computer Science",
    credits: 3,
    description: "Year-long team project applying software engineering principles. Industry sponsor mentorship.",
    prerequisites: ["CS 370"],
    schedule: [{ days: ["Friday"], startTime: "14:00", endTime: "16:50" }],
    instructor: "Dr. Michael Torres",
    capacity: 25,
    enrolled: 12,
    semester: "Fall 2025",
    tags: ["core", "project-heavy", "senior-only"],
  },
  {
    id: "c-010",
    code: "CS 430",
    name: "Computer Graphics",
    department: "Computer Science",
    credits: 3,
    description: "3D rendering, shading, ray tracing, GPU programming, and real-time graphics.",
    prerequisites: ["CS 201", "MATH 251"],
    schedule: [{ days: ["Monday", "Wednesday", "Friday"], startTime: "11:00", endTime: "11:50" }],
    instructor: "Prof. David Zhang",
    capacity: 30,
    enrolled: 22,
    semester: "Fall 2025",
    tags: ["elective", "math-heavy", "creative"],
  },
  {
    id: "c-011",
    code: "CS 480",
    name: "Compiler Design",
    department: "Computer Science",
    credits: 3,
    description: "Lexical analysis, parsing, semantic analysis, code generation, and optimization techniques.",
    prerequisites: ["CS 301", "CS 210"],
    schedule: [{ days: ["Tuesday", "Thursday"], startTime: "13:00", endTime: "14:15" }],
    instructor: "Prof. Margaret Liu",
    capacity: 25,
    enrolled: 10,
    semester: "Fall 2025",
    tags: ["elective", "theory-heavy", "challenging"],
  },
  {
    id: "c-012",
    code: "MATH 310",
    name: "Numerical Analysis",
    department: "Mathematics",
    credits: 3,
    description: "Numerical methods for solving equations, interpolation, integration, and differential equations.",
    prerequisites: ["MATH 152", "MATH 251"],
    schedule: [{ days: ["Monday", "Wednesday", "Friday"], startTime: "09:00", endTime: "09:50" }],
    instructor: "Dr. Anna Kowalski",
    capacity: 35,
    enrolled: 30,
    semester: "Fall 2025",
    tags: ["math-minor", "applied"],
  },
  {
    id: "c-013",
    code: "MATH 340",
    name: "Abstract Algebra",
    department: "Mathematics",
    credits: 3,
    description: "Groups, rings, fields, and their applications to cryptography and coding theory.",
    prerequisites: ["MATH 251", "CS 220"],
    schedule: [{ days: ["Tuesday", "Thursday"], startTime: "10:30", endTime: "11:45" }],
    instructor: "Dr. Robert Hayes",
    capacity: 25,
    enrolled: 14,
    semester: "Fall 2025",
    tags: ["math-minor", "theory-heavy"],
  },
  {
    id: "c-014",
    code: "PHIL 210",
    name: "Ethics in Technology",
    department: "Philosophy",
    credits: 3,
    description: "Ethical implications of AI, data privacy, algorithmic bias, and technology's impact on society.",
    prerequisites: [],
    schedule: [{ days: ["Tuesday", "Thursday"], startTime: "16:00", endTime: "17:15" }],
    instructor: "Prof. Carla Reyes",
    capacity: 50,
    enrolled: 38,
    semester: "Fall 2025",
    tags: ["general-ed", "humanities", "no-prereqs"],
  },
  {
    id: "c-015",
    code: "COMM 200",
    name: "Technical Communication",
    department: "Communications",
    credits: 3,
    description: "Writing and presenting technical information for diverse audiences. Proposals, reports, and documentation.",
    prerequisites: ["ENG 102"],
    schedule: [{ days: ["Monday", "Wednesday"], startTime: "14:00", endTime: "15:15" }],
    instructor: "Prof. Daniel Park",
    capacity: 30,
    enrolled: 22,
    semester: "Fall 2025",
    tags: ["general-ed", "writing-intensive"],
  },
]

// ==========================================
// COURSE REVIEWS
// ==========================================

export const courseReviews: CourseReview[] = [
  // CS 370 - Software Engineering
  {
    id: "r-001", courseId: "c-001", courseCode: "CS 370", rating: 4.5, difficulty: 3, workload: "Moderate - mainly group project work",
    teachingStyle: "Project-based with real industry tools. Weekly standups with your team. Dr. Chen brings in guest speakers from tech companies.",
    comment: "One of the best CS courses I've taken. The group project is intense but you actually build something real. Dr. Chen is incredibly supportive and gives detailed feedback. Make sure you pick your team carefully though!",
    grade: "A-", semester: "Spring 2025", anonymous: true, upvotes: 45, createdAt: "2025-05-15",
  },
  {
    id: "r-002", courseId: "c-001", courseCode: "CS 370", rating: 4.0, difficulty: 4, workload: "Heavy toward end of semester",
    teachingStyle: "Mix of lectures and hands-on workshops. Uses agile methodology for the class project.",
    comment: "Great practical experience but the project deadlines at the end are brutal. Start early! The lectures on design patterns are super useful for interviews too.",
    grade: "B+", semester: "Spring 2025", anonymous: true, upvotes: 32, createdAt: "2025-05-18",
  },
  {
    id: "r-003", courseId: "c-001", courseCode: "CS 370", rating: 5.0, difficulty: 3, workload: "Manageable with good time management",
    teachingStyle: "Very organized. Clear rubrics for everything. Code reviews are part of the grade.",
    comment: "Dr. Chen is the GOAT. Seriously the most organized professor I've had. Everything is clearly laid out from day one. The project is challenging but the process she teaches makes it manageable.",
    grade: "A", semester: "Fall 2024", anonymous: false, upvotes: 67, createdAt: "2024-12-20",
  },

  // CS 380 - Computer Networks
  {
    id: "r-004", courseId: "c-002", courseCode: "CS 380", rating: 3.5, difficulty: 4, workload: "Heavy - lots of labs and reading",
    teachingStyle: "Traditional lectures with Wireshark labs. Prof. Morton is thorough but can be dry.",
    comment: "Content is really important for your career but the delivery isn't the most engaging. The labs are the best part - you actually configure routers and analyze packets. Exams are tough and very detail-oriented.",
    grade: "B", semester: "Spring 2025", anonymous: true, upvotes: 28, createdAt: "2025-05-20",
  },
  {
    id: "r-005", courseId: "c-002", courseCode: "CS 380", rating: 3.0, difficulty: 5, workload: "Very heavy - read the textbook!",
    teachingStyle: "Lecture-heavy. Follows the textbook closely. Labs are separate from lecture content sometimes.",
    comment: "Fair warning: this class is harder than it looks. The material itself isn't that complex but there's SO much of it. Prof. Morton expects you to know every detail for exams. Office hours are helpful though.",
    grade: "B-", semester: "Fall 2024", anonymous: true, upvotes: 41, createdAt: "2024-12-15",
  },

  // CS 410 - Machine Learning
  {
    id: "r-006", courseId: "c-003", courseCode: "CS 410", rating: 4.8, difficulty: 5, workload: "Very heavy but worth every minute",
    teachingStyle: "Excellent lectures with visual explanations. Dr. Patel breaks down complex math beautifully. Jupyter notebooks for every lecture.",
    comment: "If you're interested in ML, take this class. Dr. Patel is an amazing lecturer who makes complex topics accessible. The assignments are tough and the math is real, but you'll come out actually understanding how these models work. A lot of job-relevant skills here.",
    grade: "A-", semester: "Spring 2025", anonymous: true, upvotes: 89, createdAt: "2025-05-12",
  },
  {
    id: "r-007", courseId: "c-003", courseCode: "CS 410", rating: 4.5, difficulty: 5, workload: "Expect 15+ hours per week outside class",
    teachingStyle: "Theory-first approach then practical implementations. Good balance but assumes strong math background.",
    comment: "Make sure your linear algebra and statistics are solid before taking this. The homework assignments take forever but you learn a ton. The final project is open-ended and really fun. Dr. Patel is always available to help.",
    grade: "B+", semester: "Fall 2024", anonymous: false, upvotes: 56, createdAt: "2024-12-18",
  },

  // CS 420 - AI
  {
    id: "r-008", courseId: "c-004", courseCode: "CS 420", rating: 4.2, difficulty: 4, workload: "Moderate - project-based mostly",
    teachingStyle: "Engaging lectures with lots of demos. Dr. Torres is passionate about AI and it shows. Socratic method for discussions.",
    comment: "Really interesting course that covers a wide range of AI topics. The projects are creative - we built a game-playing agent for the midterm. Dr. Torres encourages class participation and the discussions are genuinely interesting.",
    grade: "A", semester: "Spring 2025", anonymous: true, upvotes: 37, createdAt: "2025-05-14",
  },
  {
    id: "r-009", courseId: "c-004", courseCode: "CS 420", rating: 4.0, difficulty: 4, workload: "Moderate with spikes around project deadlines",
    teachingStyle: "Mix of theory and practice. Uses Python exclusively. Some overlap with CS 410.",
    comment: "If you're choosing between this and ML, they complement each other well but have some overlap. AI is broader and more philosophical while ML goes deeper on the math. Both are great choices.",
    grade: "B+", semester: "Fall 2024", anonymous: true, upvotes: 29, createdAt: "2024-12-22",
  },

  // CS 440 - Cybersecurity
  {
    id: "r-010", courseId: "c-005", courseCode: "CS 440", rating: 4.7, difficulty: 4, workload: "Heavy lab work but engaging",
    teachingStyle: "Very hands-on. CTF competitions, pen testing labs, and real-world case studies. Prof. Nakamura has industry experience.",
    comment: "Hands down the most fun I've had in a CS class. The CTF challenges are addictive and Prof. Nakamura tells war stories from her time in industry. You need Networks first and it really helps to understand that material well. REQUIRES CS 380 as a prerequisite.",
    grade: "A", semester: "Spring 2025", anonymous: false, upvotes: 52, createdAt: "2025-05-16",
  },

  // CS 450 - Cloud Computing
  {
    id: "r-011", courseId: "c-006", courseCode: "CS 450", rating: 4.3, difficulty: 3, workload: "Moderate - mostly projects",
    teachingStyle: "Very practical. Uses AWS and Docker extensively. Dr. Wright is an ex-Google engineer and shares industry insights.",
    comment: "Incredibly relevant for getting a job. You learn Docker, Kubernetes, CI/CD, and cloud deployments. The projects are practical and you end up with a solid portfolio. Dr. Wright is approachable and gives great career advice.",
    grade: "A", semester: "Spring 2025", anonymous: true, upvotes: 61, createdAt: "2025-05-19",
  },
  {
    id: "r-012", courseId: "c-006", courseCode: "CS 450", rating: 4.0, difficulty: 3, workload: "Manageable if you're familiar with Linux",
    teachingStyle: "Project-driven with short lectures. Each week has a new deployment challenge.",
    comment: "If you're comfortable with terminal and Linux basics, this class is very manageable. If not, expect to spend extra time getting up to speed. The content is gold for interviews though.",
    grade: "A-", semester: "Fall 2024", anonymous: true, upvotes: 38, createdAt: "2024-12-21",
  },

  // CS 460 - Mobile App Dev
  {
    id: "r-013", courseId: "c-007", courseCode: "CS 460", rating: 4.1, difficulty: 2, workload: "Light to moderate",
    teachingStyle: "Workshop-style. Prof. Kim live-codes and walks through building apps step by step. Very beginner-friendly.",
    comment: "Super fun class! You build multiple apps throughout the semester. Prof. Kim is patient and explains things clearly. It's not the hardest class but you learn practical skills fast. Great for building your portfolio.",
    grade: "A", semester: "Spring 2025", anonymous: true, upvotes: 33, createdAt: "2025-05-17",
  },

  // CS 470 - Distributed Systems
  {
    id: "r-014", courseId: "c-008", courseCode: "CS 470", rating: 3.8, difficulty: 5, workload: "Very heavy - challenging assignments",
    teachingStyle: "Theory-heavy lectures. Dr. Chen assumes you know OS and Networks well. Whiteboard-intensive.",
    comment: "Not for the faint of heart. This is one of the hardest CS electives. The assignments involve implementing distributed protocols from scratch. But if you want to work at FAANG, this material comes up in system design interviews constantly.",
    grade: "B", semester: "Spring 2025", anonymous: true, upvotes: 25, createdAt: "2025-05-21",
  },

  // CS 430 - Computer Graphics
  {
    id: "r-015", courseId: "c-010", courseCode: "CS 430", rating: 4.4, difficulty: 4, workload: "Heavy but creative",
    teachingStyle: "Prof. Zhang is a visual thinker. Lots of diagrams and live demos. Assignments are creative - you build a full ray tracer.",
    comment: "If you're even slightly interested in graphics, game dev, or visual computing, take this. Building a ray tracer from scratch is incredibly satisfying. The math (linear algebra) is real but Prof. Zhang explains it well.",
    grade: "A-", semester: "Spring 2025", anonymous: false, upvotes: 40, createdAt: "2025-05-13",
  },

  // CS 480 - Compiler Design
  {
    id: "r-016", courseId: "c-011", courseCode: "CS 480", rating: 3.9, difficulty: 5, workload: "Very heavy but rewarding",
    teachingStyle: "Traditional lecture style. Prof. Liu is very methodical and organized. Dragon Book is the textbook.",
    comment: "Building a compiler from scratch over the semester is one of the most rewarding things I've done in college. It's incredibly challenging but you understand programming at a much deeper level. Small class size means lots of individual attention.",
    grade: "B+", semester: "Fall 2024", anonymous: true, upvotes: 22, createdAt: "2024-12-19",
  },

  // PHIL 210 - Ethics in Tech
  {
    id: "r-017", courseId: "c-014", courseCode: "PHIL 210", rating: 4.6, difficulty: 2, workload: "Light - reading and discussion",
    teachingStyle: "Socratic discussion-based. Prof. Reyes is passionate and creates a safe space for debate. No exams, just essays.",
    comment: "Every CS student should take this class. It gives you perspective on the impact of what you build. The readings are thought-provoking and discussions are genuinely engaging. Easy A if you participate and put thought into essays.",
    grade: "A", semester: "Spring 2025", anonymous: true, upvotes: 73, createdAt: "2025-05-11",
  },

  // COMM 200 - Technical Communication
  {
    id: "r-018", courseId: "c-015", courseCode: "COMM 200", rating: 3.7, difficulty: 2, workload: "Light to moderate",
    teachingStyle: "Workshop-style with peer reviews. Prof. Park gives detailed feedback on writing. Focuses on clarity and audience.",
    comment: "It's a writing class so not the most exciting, but the skills are genuinely useful. Learning to explain technical concepts clearly has helped me in every other class and in internship interviews. Prof. Park is fair and helpful.",
    grade: "A-", semester: "Spring 2025", anonymous: true, upvotes: 19, createdAt: "2025-05-20",
  },
]

// ==========================================
// SKILLS & BADGES SYSTEM
// ==========================================

// Maps course codes to the skills they teach
export const courseSkillsMap: Record<string, string[]> = {
  "CS 101": ["Programming Fundamentals", "Problem Solving", "Computational Thinking"],
  "CS 201": ["Data Structures", "Algorithm Design", "Problem Solving", "Programming Fundamentals"],
  "CS 210": ["Computer Architecture", "Systems Thinking", "Low-Level Programming"],
  "CS 220": ["Discrete Math", "Logical Reasoning", "Proof Writing"],
  "CS 301": ["Algorithm Design", "Complexity Analysis", "Problem Solving", "Discrete Math"],
  "CS 350": ["Operating Systems", "Systems Thinking", "Concurrency", "Low-Level Programming"],
  "CS 360": ["Database Design", "SQL", "Data Modeling", "Systems Thinking"],
  "CS 370": ["Software Engineering", "Teamwork", "Project Management", "Version Control"],
  "CS 380": ["Networking", "Protocol Design", "Systems Thinking"],
  "CS 410": ["Machine Learning", "Data Science", "Statistical Modeling", "Python"],
  "CS 420": ["Artificial Intelligence", "Problem Solving", "Algorithm Design", "Python"],
  "CS 430": ["Computer Graphics", "Linear Algebra Applied", "GPU Programming"],
  "CS 440": ["Cybersecurity", "Networking", "Ethical Hacking", "Cryptography"],
  "CS 450": ["Cloud Computing", "DevOps", "Containerization", "Systems Thinking"],
  "CS 460": ["Mobile Development", "UI/UX Design", "Cross-Platform Dev", "Programming Fundamentals"],
  "CS 470": ["Distributed Systems", "Concurrency", "Fault Tolerance", "Systems Thinking"],
  "CS 480": ["Compiler Design", "Language Theory", "Low-Level Programming", "Algorithm Design"],
  "CS 490": ["Software Engineering", "Teamwork", "Project Management", "Technical Leadership"],
  "MATH 151": ["Calculus", "Mathematical Reasoning"],
  "MATH 152": ["Calculus", "Mathematical Reasoning", "Integration Techniques"],
  "MATH 251": ["Linear Algebra Applied", "Mathematical Reasoning"],
  "MATH 253": ["Statistical Modeling", "Probability", "Data Science"],
  "MATH 310": ["Numerical Methods", "Mathematical Reasoning", "Calculus"],
  "MATH 340": ["Abstract Algebra", "Proof Writing", "Cryptography"],
  "ENG 101": ["Technical Writing", "Communication"],
  "ENG 102": ["Technical Writing", "Communication", "Research Skills"],
  "PHYS 201": ["Physics", "Mathematical Reasoning", "Problem Solving"],
  "PHIL 210": ["Ethics in Tech", "Critical Thinking", "Communication"],
  "COMM 200": ["Technical Writing", "Communication", "Presentation Skills"],
}

// Badge tiers based on number of courses contributing to a skill
export type BadgeTier = "bronze" | "silver" | "gold" | "platinum"

export interface SkillBadge {
  skill: string
  tier: BadgeTier
  courseCount: number
  courses: string[]
}

export function getBadgeTier(courseCount: number): BadgeTier {
  if (courseCount >= 5) return "platinum"
  if (courseCount >= 4) return "gold"
  if (courseCount >= 3) return "silver"
  return "bronze"
}

export function getStudentSkills(): SkillBadge[] {
  const allCourses = [
    ...studentProfile.completedCourses.map(c => c.code),
    ...studentProfile.currentCourses.map(c => c.code),
  ]

  const skillMap = new Map<string, string[]>()

  for (const code of allCourses) {
    const skills = courseSkillsMap[code] || []
    for (const skill of skills) {
      if (!skillMap.has(skill)) skillMap.set(skill, [])
      skillMap.get(skill)!.push(code)
    }
  }

  const badges: SkillBadge[] = []
  for (const [skill, courses] of skillMap) {
    badges.push({
      skill,
      tier: getBadgeTier(courses.length),
      courseCount: courses.length,
      courses,
    })
  }

  // Sort: platinum first, then gold, silver, bronze — and within each tier alphabetically
  const tierOrder: Record<BadgeTier, number> = { platinum: 0, gold: 1, silver: 2, bronze: 3 }
  badges.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier] || a.skill.localeCompare(b.skill))

  return badges
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getRemainingRequirements() {
  const completed = new Set(studentProfile.completedCourses.map(c => c.code))
  const current = new Set(studentProfile.currentCourses.map(c => c.code))

  const requirements = degreeRequirements["Computer Science"]

  const remainingCore = requirements.core.filter(
    c => !completed.has(c.code) && !current.has(c.code)
  )

  const completedElectives = requirements.electives.options.filter(
    c => completed.has(c.code) || current.has(c.code)
  )

  const remainingElectivesNeeded = requirements.electives.required - completedElectives.length

  return {
    remainingCore,
    remainingElectivesNeeded,
    electiveOptions: requirements.electives.options.filter(
      c => !completed.has(c.code) && !current.has(c.code)
    ),
    completedCore: requirements.core.filter(
      c => completed.has(c.code) || current.has(c.code)
    ),
  }
}

export function checkScheduleConflict(
  courseDays: string[],
  courseStart: string,
  courseEnd: string,
  events: CalendarEvent[]
): CalendarEvent[] {
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const conflicts: CalendarEvent[] = []

  for (const event of events) {
    const dayOverlap = courseDays.includes(event.day)
    if (!dayOverlap) continue

    const courseStartMin = timeToMinutes(courseStart)
    const courseEndMin = timeToMinutes(courseEnd)
    const eventStartMin = timeToMinutes(event.startTime)
    const eventEndMin = timeToMinutes(event.endTime)

    if (courseStartMin < eventEndMin && courseEndMin > eventStartMin) {
      conflicts.push(event)
    }
  }

  return conflicts
}

export function getReviewsForCourse(courseCode: string): CourseReview[] {
  return courseReviews.filter(r => r.courseCode === courseCode)
}

export function getAverageRating(courseCode: string): number {
  const reviews = getReviewsForCourse(courseCode)
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

export function meetsPrerequisites(courseCode: string): { met: boolean; missing: string[] } {
  const course = availableCourses.find(c => c.code === courseCode)
  if (!course) return { met: false, missing: [] }

  const completed = new Set(studentProfile.completedCourses.map(c => c.code))
  const current = new Set(studentProfile.currentCourses.map(c => c.code))
  const allDone = new Set([...completed, ...current])

  const missing = course.prerequisites.filter(p => !allDone.has(p))
  return { met: missing.length === 0, missing }
}
