# GradBot 🎓

A sophisticated Discord bot designed to help students track their graduation countdown with motivation, goal tracking, study sessions, and milestone celebrations.

## Features ✨

- **Daily Countdown**: Automated daily graduation countdown messages
- **Smart Scheduling**: Calculates actual school days (excludes weekends and holidays)
- **Milestone Celebrations**: Special alerts for important countdown milestones
- **Goal Tracking**: Set, track, and complete academic goals
- **Study Session Timer**: Pomodoro-style study sessions with automatic notifications
- **Custom Reminders**: Set personalized reminders for important tasks
- **Interactive Buttons**: Quick access to motivation, progress, and celebrations
- **Comprehensive Statistics**: Track your progress and study habits

## Project Structure 📁

```
GradBot/
├── src/
│   ├── config/
│   │   └── config.js          # Configuration settings
│   ├── managers/
│   │   ├── GoalsManager.js    # Goal tracking logic
│   │   ├── StudySessionManager.js  # Study session management
│   │   ├── ReminderManager.js # Custom reminder handling
│   │   └── MilestoneManager.js # Milestone tracking
│   ├── handlers/
│   │   ├── slashCommandHandler.js # Slash command processing
│   │   └── buttonHandler.js   # Button interaction handling
│   ├── services/
│   │   └── ScheduleManager.js # Cron job scheduling
│   ├── utils/
│   │   ├── dateUtils.js       # Date calculation utilities
│   │   ├── messageUtils.js    # Message generation helpers
│   │   └── embedUtils.js      # Discord embed creators
│   ├── commands/
│   │   └── commands.js        # Slash command definitions
│   └── GradBot.js            # Main bot class
├── index.js                  # Application entry point
├── web-server.js            # Express web server
├── package.json
└── README.md
```

## Commands 🚀

### `/countdown`
Get your current graduation countdown with interactive buttons.

### `/milestone`
Check your next upcoming milestone and progress.

### `/stats`
View comprehensive statistics including:
- Days remaining (total and school days)
- Goals completed
- Study sessions completed
- Total study time

### `/goals`
Manage your academic goals:
- `add` - Add a new goal
- `list` - View all goals
- `complete` - Mark a goal as completed

### `/schedule`
View upcoming Queensland school holidays.

### `/quote`
Get an inspirational quote for motivation.

### `/reminder`
Set custom reminders with specified hours delay.

### `/study`
Start a study session with optional duration (default: 25 minutes).

## Interactive Features 🎮

### Button Actions
- **🔄 Refresh**: Update the countdown display
- **💪 Motivate Me**: Get a random motivational message
- **📊 Progress**: View your progress bar and statistics
- **🎉 Celebrate**: Celebrate your achievements

### Automated Features
- **Daily Messages**: 6:00 AM daily countdown (Brisbane timezone)
- **Milestone Alerts**: Automatic notifications for special milestones
- **Study Timers**: Completion notifications for study sessions
- **Custom Reminders**: Scheduled reminder delivery

## Setup & Installation 🔧

### Prerequisites
- Node.js 18.0.0 or higher
- Discord Bot Token
- Discord User ID

### Environment Variables
Create a `.env` file:
```env
BOT_TOKEN=your_discord_bot_token
USER_ID=your_discord_user_id

PORT=3000 # Optional
```

### Installation
```bash
# Install dependencies
npm install

# Start the bot
npm start

# Development mode (with auto-restart)
npm run dev
```

## Configuration ⚙️

### Graduation Date
Update the graduation date in `src/config/config.js`:
```javascript
GRADUATION_DATE: new Date('2025-11-21')
```

### School Holidays
Modify the `QLD_HOLIDAYS` array in `src/config/config.js` to match your school calendar.

### Milestones
Customize milestone days in the `MILESTONES` array:
```javascript
MILESTONES: [500, 365, 300, 250, 200, 150, 100, 75, 50, 30, 25, 20, 15, 10, 7, 5, 3, 2, 1]
```

## Architecture 🏗️

### Manager Classes
- **GoalsManager**: Handles goal CRUD operations
- **StudySessionManager**: Tracks study sessions and statistics
- **ReminderManager**: Manages custom reminders
- **MilestoneManager**: Tracks and triggers milestone celebrations

### Service Classes
- **ScheduleManager**: Handles all cron job scheduling and execution

### Utility Modules
- **dateUtils**: Date calculations and school day logic
- **messageUtils**: Message generation and randomization
- **embedUtils**: Discord embed creation and formatting

### Handler Modules
- **slashCommandHandler**: Processes all slash command interactions
- **buttonHandler**: Manages button click interactions

## Development Scripts 📝

```bash
npm run dev      # Start with nodemon for development
npm run test     # Run Jest tests
npm run lint     # ESLint code checking
npm run format   # Prettier code formatting
```

## Web Interface 🌐

The bot includes an Express web server for status monitoring and basic web interface (served from `web-server.js`).

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License 📄

MIT License - see LICENSE file for details.

## Support 🆘

For support or questions about GradBot, please open an issue on the GitHub repository.

---

*Keep pushing forward! Your future awaits! ✨*
