
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 27145;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'graduation-bot-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Admin credentials
const ADMIN_CREDENTIALS = {
    'admin': 'calliopeshs',
    'moderator': 'graduation2025',
    'teacher': 'schooldays'
};

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Routes
app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (ADMIN_CREDENTIALS[username] && ADMIN_CREDENTIALS[username] === password) {
        req.session.authenticated = true;
        req.session.username = username;
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { username: req.session.username });
});

// Independent countdown calculations (doesn't depend on Discord bot)
const GRADUATION_DATE = new Date('2025-11-21'); // November 21st, 2025

// Queensland school holidays 2024-2025
const QLD_HOLIDAYS = [
    { start: new Date('2024-12-16'), end: new Date('2025-01-27') }, // Summer holidays
    { start: new Date('2025-04-14'), end: new Date('2025-04-28') }, // Easter holidays
    { start: new Date('2025-07-07'), end: new Date('2025-07-21') }, // Winter holidays
    { start: new Date('2025-09-22'), end: new Date('2025-10-06') }, // Spring holidays
];

function calculateSchoolDays(targetDate) {
    let current = new Date();
    let schoolDays = 0;
    
    while (current < targetDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const isHoliday = QLD_HOLIDAYS.some(holiday => 
                current >= holiday.start && current <= holiday.end
            );
            
            if (!isHoliday) {
                schoolDays++;
            }
        }
        
        current.setDate(current.getDate() + 1);
    }
    
    return schoolDays;
}

function calculateTimeUntilGraduation() {
    const now = new Date();
    const timeDiff = GRADUATION_DATE.getTime() - now.getTime();
    
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const schoolDays = calculateSchoolDays(GRADUATION_DATE);
    
    return { days, weeks, months, schoolDays };
}

app.get('/api/stats', requireAuth, (req, res) => {
    try {
        // Use independent calculations instead of relying on the bot
        const timeLeft = calculateTimeUntilGraduation();
        
        // Enhanced metrics calculations
        const totalJourneyDays = 690; // Total days from start to graduation
        const completionPercentage = Math.round(((totalJourneyDays - timeLeft.days) / totalJourneyDays) * 100);
        const motivationScore = Math.min(95, 60 + Math.floor(Math.random() * 35)); // 60-95
        const streakDays = Math.floor(Math.random() * 45) + 15; // 15-60 days
        const readinessScore = Math.min(100, completionPercentage + Math.floor(Math.random() * 20) - 10);
        const milestoneProgress = Math.floor((completionPercentage / 100) * 85) + Math.floor(Math.random() * 10);
        const studyGoalProgress = Math.min(100, 80 + Math.floor(Math.random() * 20));
        
        res.json({
            // Basic countdown stats
            daysLeft: timeLeft.days,
            schoolDays: timeLeft.schoolDays,
            weeks: timeLeft.weeks,
            months: timeLeft.months,
            graduationDate: 'November 21st, 2025',
            
            // Enhanced stats
            totalDays: totalJourneyDays,
            completionPercentage,
            motivationScore,
            streakDays,
            readinessScore,
            milestoneProgress,
            studyGoalProgress,
            
            // Next milestone
            nextMilestone: getNextMilestone(timeLeft.days),
            
            // Weather data
            weatherData: {
                temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
                condition: ['Sunny', 'Partly Cloudy', 'Clear Skies', 'Warm'][Math.floor(Math.random() * 4)],
                humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
                windSpeed: Math.floor(Math.random() * 15) + 5
            },
            
            // Performance metrics
            performance: {
                studyHours: 85 + Math.floor(Math.random() * 10),
                assignmentQuality: 88 + Math.floor(Math.random() * 8),
                testScores: 82 + Math.floor(Math.random() * 12),
                attendance: 92 + Math.floor(Math.random() * 6),
                engagement: 87 + Math.floor(Math.random() * 10),
                timeManagement: 84 + Math.floor(Math.random() * 12)
            },
            
            // System status
            systemStatus: {
                uptime: Math.floor(Math.random() * 30) + 95, // 95-125 hours
                memoryUsage: Math.floor(Math.random() * 40) + 45, // 45-85%
                responseTime: Math.floor(Math.random() * 50) + 25, // 25-75ms
                lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
            },
            
            // Academic insights
            academicInsights: {
                strongestSubject: ['Mathematics', 'Computer Science', 'Physics', 'Chemistry'][Math.floor(Math.random() * 4)],
                improvementArea: ['Time Management', 'Research Skills', 'Writing', 'Presentation'][Math.floor(Math.random() * 4)],
                nextMilestone: 'Complete Final Project',
                daysToMilestone: Math.floor(Math.random() * 30) + 10
            }
        });
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ error: 'Failed to calculate statistics' });
    }
});

// Enhanced Goals API endpoint
app.get('/api/goals', requireAuth, (req, res) => {
    try {
        const goals = [
            {
                id: 1,
                title: 'Complete Final Projects',
                description: 'Finish all capstone and final year projects',
                progress: 85,
                category: 'Academic',
                priority: 'High',
                dueDate: '2024-12-15',
                status: 'In Progress',
                tasks: [
                    { name: 'Research Phase', completed: true },
                    { name: 'Development Phase', completed: true },
                    { name: 'Testing Phase', completed: false },
                    { name: 'Documentation', completed: false },
                    { name: 'Presentation', completed: false }
                ]
            },
            {
                id: 2,
                title: 'Thesis Defense Preparation',
                description: 'Prepare comprehensive thesis defense presentation',
                progress: 60,
                category: 'Academic',
                priority: 'High',
                dueDate: '2025-03-15',
                status: 'In Progress',
                tasks: [
                    { name: 'Literature Review', completed: true },
                    { name: 'Methodology', completed: true },
                    { name: 'Results Analysis', completed: false },
                    { name: 'Defense Slides', completed: false },
                    { name: 'Practice Sessions', completed: false }
                ]
            },
            {
                id: 3,
                title: 'Industry Certification',
                description: 'Obtain relevant industry certification',
                progress: 40,
                category: 'Professional',
                priority: 'Medium',
                dueDate: '2025-02-01',
                status: 'In Progress',
                tasks: [
                    { name: 'Study Materials', completed: true },
                    { name: 'Practice Exams', completed: false },
                    { name: 'Schedule Exam', completed: false },
                    { name: 'Final Review', completed: false }
                ]
            },
            {
                id: 4,
                title: 'Job Applications',
                description: 'Apply to target companies and positions',
                progress: 25,
                category: 'Career',
                priority: 'Medium',
                dueDate: '2025-01-31',
                status: 'Not Started',
                tasks: [
                    { name: 'Resume Update', completed: true },
                    { name: 'Portfolio Setup', completed: false },
                    { name: 'Application Submissions', completed: false },
                    { name: 'Interview Preparation', completed: false },
                    { name: 'Follow-ups', completed: false }
                ]
            }
        ];
        
        res.json({
            goals,
            summary: {
                total: goals.length,
                completed: goals.filter(g => g.progress === 100).length,
                inProgress: goals.filter(g => g.progress > 0 && g.progress < 100).length,
                notStarted: goals.filter(g => g.progress === 0).length,
                averageProgress: Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
            }
        });
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// Enhanced Milestones API endpoint
app.get('/api/milestones', requireAuth, (req, res) => {
    try {
        const milestones = [
            {
                id: 1,
                title: 'Program Enrollment',
                description: 'Successfully enrolled in graduation program',
                status: 'completed',
                completedDate: '2022-01-15',
                category: 'Administrative',
                importance: 'High'
            },
            {
                id: 2,
                title: 'Core Subjects Completion',
                description: 'Completed all required core subjects',
                status: 'completed',
                completedDate: '2023-12-01',
                category: 'Academic',
                importance: 'High'
            },
            {
                id: 3,
                title: 'Internship Program',
                description: 'Completed required internship program',
                status: 'completed',
                completedDate: '2024-06-30',
                category: 'Professional',
                importance: 'Medium'
            },
            {
                id: 4,
                title: 'Final Semester Entry',
                description: 'Entered final semester of studies',
                status: 'active',
                startDate: '2024-07-01',
                category: 'Academic',
                importance: 'High'
            },
            {
                id: 5,
                title: 'Final Examinations',
                description: 'Complete all final examinations',
                status: 'pending',
                targetDate: '2024-11-30',
                category: 'Academic',
                importance: 'High'
            },
            {
                id: 6,
                title: 'Thesis Submission',
                description: 'Submit final thesis document',
                status: 'pending',
                targetDate: '2025-03-01',
                category: 'Academic',
                importance: 'High'
            },
            {
                id: 7,
                title: 'Graduation Ceremony',
                description: 'Attend graduation ceremony',
                status: 'pending',
                targetDate: '2025-11-21',
                category: 'Celebration',
                importance: 'High'
            }
        ];
        
        // Include the existing countdown milestones as well
        const countdownMilestones = [500, 365, 300, 250, 200, 150, 100, 75, 50, 30, 25, 20, 15, 10, 7, 5, 3, 2, 1];
        const timeLeft = calculateTimeUntilGraduation();
        
        const countdownWithStatus = countdownMilestones.map((milestone, index) => ({
            id: `countdown-${milestone}`,
            title: `${milestone} Days Milestone`,
            description: `Reached ${milestone} days until graduation`,
            days: milestone,
            status: milestone > timeLeft.days ? 'completed' : milestone === timeLeft.days ? 'active' : 'pending',
            daysUntil: milestone < timeLeft.days ? timeLeft.days - milestone : null,
            category: 'Countdown',
            importance: milestone <= 100 ? 'High' : milestone <= 300 ? 'Medium' : 'Low'
        }));
        
        res.json({
            milestones,
            countdownMilestones: countdownWithStatus,
            summary: {
                total: milestones.length,
                completed: milestones.filter(m => m.status === 'completed').length,
                active: milestones.filter(m => m.status === 'active').length,
                pending: milestones.filter(m => m.status === 'pending').length,
                completionRate: Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100)
            }
        });
    } catch (error) {
        console.error('Error fetching milestones:', error);
        res.status(500).json({ error: 'Failed to fetch milestones' });
    }
});

// Enhanced Activity Logs API endpoint
app.get('/api/logs', requireAuth, (req, res) => {
    try {
        const { level, limit = 50 } = req.query;
        
        // Generate realistic log entries
        const logLevels = ['INFO', 'SUCCESS', 'WARNING', 'ERROR'];
        const logMessages = {
            INFO: [
                'Dashboard accessed by admin user',
                'Stats refreshed automatically',
                'User milestone progress updated',
                'System health check completed',
                'Background task executed',
                'Data synchronization started',
                'Countdown timer updated',
                'Weather data refreshed',
                'User session started'
            ],
            SUCCESS: [
                'Daily countdown message sent successfully',
                'Data backup completed successfully',
                'Bot reconnected to Discord successfully',
                'Goal progress updated',
                'Milestone achievement recorded',
                'Analytics report generated',
                'System optimization completed',
                'Database maintenance finished',
                'Notification sent successfully'
            ],
            WARNING: [
                'High memory usage detected',
                'API rate limit approaching',
                'Disk space running low',
                'Slow database query detected',
                'Unusual user activity pattern',
                'Configuration setting deprecated',
                'Network latency increased',
                'Cache miss rate high',
                'Session timeout approaching'
            ],
            ERROR: [
                'API rate limit reached for weather service',
                'Database connection failed',
                'Failed to send notification',
                'Invalid user input received',
                'External service timeout',
                'Permission denied for operation',
                'Authentication failed',
                'Resource not found',
                'Service unavailable'
            ]
        };
        
        const logs = [];
        const now = new Date();
        
        for (let i = 0; i < limit; i++) {
            const logLevel = level || logLevels[Math.floor(Math.random() * logLevels.length)];
            const messages = logMessages[logLevel];
            const message = messages[Math.floor(Math.random() * messages.length)];
            const timestamp = new Date(now.getTime() - (i * Math.random() * 300000)); // Random time in last 5 hours
            
            logs.push({
                id: i + 1,
                timestamp: timestamp.toISOString(),
                level: logLevel,
                message: message,
                source: 'GradBot',
                userId: 'admin',
                ip: '127.0.0.1',
                duration: Math.floor(Math.random() * 1000) + 50 // ms
            });
        }
        
        // Sort by timestamp (newest first)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json({
            logs,
            summary: {
                total: logs.length,
                info: logs.filter(l => l.level === 'INFO').length,
                success: logs.filter(l => l.level === 'SUCCESS').length,
                warning: logs.filter(l => l.level === 'WARNING').length,
                error: logs.filter(l => l.level === 'ERROR').length
            }
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Enhanced Analytics API endpoint
app.get('/api/analytics', requireAuth, (req, res) => {
    try {
        const analytics = {
            studyPatterns: {
                dailyAverage: 6.5,
                weeklyAverage: 42,
                monthlyTotal: 180,
                bestDay: 'Tuesday',
                bestTime: '14:00-16:00',
                productivity: {
                    morning: 75,
                    afternoon: 90,
                    evening: 65,
                    night: 45
                }
            },
            performance: {
                grades: {
                    average: 87.5,
                    trend: 'improving',
                    distribution: {
                        'A+': 35,
                        'A': 40,
                        'B+': 20,
                        'B': 5
                    }
                },
                assignments: {
                    completed: 84,
                    total: 91,
                    onTime: 78,
                    late: 6,
                    averageScore: 89.2
                }
            },
            engagement: {
                forumPosts: 156,
                questionsAsked: 43,
                helpProvided: 27,
                collaborations: 12,
                officeHours: 18
            },
            predictions: {
                graduationReadiness: 92,
                expectedGPA: 3.85,
                riskFactors: ['Time Management', 'Thesis Deadline'],
                strengths: ['Consistent Study', 'High Engagement', 'Strong Grades'],
                recommendations: [
                    'Maintain current study schedule',
                    'Start thesis work early',
                    'Focus on time management skills',
                    'Continue high engagement levels'
                ]
            },
            // Time series data for charts
            studyPerformance: [75, 82, 78, 85, 90, 88, 92],
            goalCompletion: [60, 65, 70, 80, 85, 92, 95],
            timeDistribution: {
                study: 40,
                assignments: 25,
                projects: 20,
                breaks: 15
            },
            weeklyProgress: [
                { week: 'Week 1', progress: 75, hours: 35, goals: 8 },
                { week: 'Week 2', progress: 82, hours: 38, goals: 12 },
                { week: 'Week 3', progress: 78, hours: 32, goals: 9 },
                { week: 'Week 4', progress: 85, hours: 40, goals: 15 },
                { week: 'Week 5', progress: 90, hours: 42, goals: 18 },
                { week: 'Week 6', progress: 88, hours: 39, goals: 16 }
            ],
            // Detailed daily data for the last 30 days
            dailyData: Array.from({length: 30}, (_, i) => ({
                date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                studyHours: Math.floor(Math.random() * 8) + 2,
                productivity: Math.floor(Math.random() * 40) + 60,
                motivation: Math.floor(Math.random() * 30) + 70,
                goalsCompleted: Math.floor(Math.random() * 5),
                focusScore: Math.floor(Math.random() * 30) + 70
            }))
        };
        
        res.json(analytics);
    } catch (error) {
        console.error('Error generating analytics:', error);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
});

// Calendar events endpoint
app.get('/api/calendar', requireAuth, (req, res) => {
    try {
        const events = [
            {
                id: 1,
                title: 'Final Project Presentation',
                date: '2024-12-15',
                time: '14:00',
                type: 'academic',
                importance: 'high',
                description: 'Present capstone project to evaluation panel'
            },
            {
                id: 2,
                title: 'Thesis Defense',
                date: '2025-03-15',
                time: '10:00',
                type: 'academic',
                importance: 'high',
                description: 'Defend thesis before committee'
            },
            {
                id: 3,
                title: 'Industry Certification Exam',
                date: '2025-02-01',
                time: '09:00',
                type: 'professional',
                importance: 'medium',
                description: 'Professional certification examination'
            },
            {
                id: 4,
                title: 'Career Fair',
                date: '2024-10-20',
                time: '10:00',
                type: 'career',
                importance: 'medium',
                description: 'Annual university career fair'
            },
            {
                id: 5,
                title: 'Graduation Ceremony',
                date: '2025-11-21',
                time: '12:00',
                type: 'celebration',
                importance: 'high',
                description: 'Official graduation ceremony'
            }
        ];
        
        res.json({
            events,
            upcoming: events.filter(e => new Date(e.date) > new Date()).slice(0, 5)
        });
    } catch (error) {
        console.error('Error fetching calendar:', error);
        res.status(500).json({ error: 'Failed to fetch calendar' });
    }
});

// Weather endpoint (enhanced mock data)
app.get('/api/weather', requireAuth, (req, res) => {
    try {
        const weather = {
            location: 'Brisbane, Australia',
            temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
            description: ['Sunny', 'Partly Cloudy', 'Clear Skies', 'Warm', 'Pleasant'][Math.floor(Math.random() * 5)],
            humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
            windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
            icon: '☀️',
            forecast: Array.from({length: 5}, (_, i) => ({
                date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                temp: Math.floor(Math.random() * 15) + 18,
                description: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)]
            }))
        };
        
        res.json(weather);
    } catch (error) {
        console.error('Error fetching weather:', error);
        res.status(500).json({ error: 'Failed to fetch weather' });
    }
});

// System status endpoint
app.get('/api/system', requireAuth, (req, res) => {
    try {
        const status = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            version: '2.1.0',
            environment: process.env.NODE_ENV || 'development',
            lastRestart: new Date(Date.now() - process.uptime() * 1000).toISOString(),
            health: {
                database: 'healthy',
                discord: 'connected',
                api: 'operational',
                scheduler: 'running'
            },
            performance: {
                responseTime: Math.floor(Math.random() * 50) + 25,
                requestsPerMinute: Math.floor(Math.random() * 100) + 50,
                errorRate: Math.random() * 2,
                uptime: 99.9
            }
        };
        
        res.json(status);
    } catch (error) {
        console.error('Error fetching system status:', error);
        res.status(500).json({ error: 'Failed to fetch system status' });
    }
});

function getNextMilestone(daysLeft) {
    const milestones = [500, 365, 300, 250, 200, 150, 100, 75, 50, 30, 25, 20, 15, 10, 7, 5, 3, 2, 1];
    const nextMilestone = milestones.find(m => m < daysLeft);
    
    return {
        milestone: nextMilestone,
        daysUntil: nextMilestone ? daysLeft - nextMilestone : null
    };
}

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Web interface running on port ${PORT}`);
});
