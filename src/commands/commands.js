const config = require('../config/config');

/**
 * Slash Commands definitions
 */
const commands = [
    {
        name: 'countdown',
        description: 'Get your graduation countdown',
    },
    {
        name: 'milestone',
        description: 'Check upcoming milestones',
    },
    {
        name: 'stats',
        description: 'View detailed graduation statistics',
    },
    {
        name: 'goals',
        description: 'Set and track academic goals',
        options: [
            {
                name: 'action',
                type: 3, // STRING
                description: 'Action to perform (add, list, complete)',
                required: true,
                choices: [
                    { name: 'Add Goal', value: 'add' },
                    { name: 'List Goals', value: 'list' },
                    { name: 'Complete Goal', value: 'complete' }
                ]
            },
            {
                name: 'goal',
                type: 3, // STRING
                description: 'Goal description (for add/complete actions)',
                required: false
            }
        ]
    },
    {
        name: 'schedule',
        description: 'View upcoming school schedule and holidays',
    },
    {
        name: 'quote',
        description: 'Get an inspirational quote for motivation',
    },
    {
        name: 'reminder',
        description: 'Set a custom reminder',
        options: [
            {
                name: 'message',
                type: 3, // STRING
                description: 'Reminder message',
                required: true
            },
            {
                name: 'hours',
                type: 4, // INTEGER
                description: 'Hours from now to remind',
                required: true
            }
        ]
    },
    {
        name: 'study',
        description: 'Study session tracker and timer',
        options: [
            {
                name: 'duration',
                type: 4, // INTEGER
                description: 'Study session duration in minutes',
                required: false
            }
        ]
    }
];

module.exports = commands;
