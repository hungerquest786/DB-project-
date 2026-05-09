# Programming Contest Management System

A simple online programming contest management system built with Node.js, MySQL, and Bootstrap.

## Features

- **User Authentication**: Login system for Admins and Participants
- **Admin Dashboard**: 
  - Create and manage contests
  - Add problems to contests
  - View submissions overview
- **Participant Portal**:
  - View available contests
  - Solve problems and submit code
  - Track submission history
- **Code Editor**: Integrated code editor with syntax highlighting
- **Real-time Status**: Track submission status (pending, accepted, wrong answer, etc.)

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MySQL
- **Frontend**: HTML5, Bootstrap 5, JavaScript
- **Code Editor**: CodeMirror

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Database Setup

1. Create a MySQL database (or use the provided script)

2. Import the database schema:

```bash
mysql -u root -p < database.sql
```

**Note**: The default MySQL configuration assumes:
- Host: localhost
- Username: root
- Password: (empty)
- Database: contest_system

If your MySQL setup is different, update the configuration in `server/app.js`:

```javascript
const dbConfig = {
    host: 'localhost',        // Your MySQL host
    user: 'root',            // Your MySQL username
    password: 'your_password', // Your MySQL password
    database: 'contest_system'
};
```

### Step 3: Start the Application

#### Development Mode (with auto-restart):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

The application will start on `http://localhost:3000`

## Default Login Credentials

### Admin Account
- **Username**: admin
- **Password**: admin123

### Participant Account
- **Username**: participant1
- **Password**: user123

## Project Structure

```
ProgrammingContestSystem/
├── public/                  # Frontend files
│   ├── login.html          # Login page
│   ├── admin.html          # Admin dashboard
│   └── participant.html    # Participant portal
├── server/                 # Backend files
│   └── app.js              # Express server and API routes
├── database.sql            # Database schema and sample data
├── package.json            # Node.js dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/current-user` - Get current logged-in user

### Contests
- `GET /api/contests` - Get all contests
- `POST /api/contests` - Create new contest (Admin only)

### Problems
- `GET /api/contests/:contestId/problems` - Get problems for a contest
- `POST /api/problems` - Create new problem (Admin only)

### Submissions
- `POST /api/submissions` - Submit code solution
- `GET /api/submissions/:userId` - Get user submissions

## Database Schema

### Users Table
- `user_id` (Primary Key)
- `username` (Unique)
- `password` (Hashed)
- `email` (Unique)
- `role` ('admin' or 'participant')

### Contests Table
- `contest_id` (Primary Key)
- `title`
- `description`
- `start_time`
- `end_time`
- `created_by` (Foreign Key to Users)

### Problems Table
- `problem_id` (Primary Key)
- `contest_id` (Foreign Key to Contests)
- `title`
- `description`
- `input_format`
- `output_format`
- `sample_input`
- `sample_output`
- `time_limit`
- `memory_limit`
- `points`

### Submissions Table
- `submission_id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `problem_id` (Foreign Key to Problems)
- `contest_id` (Foreign Key to Contests)
- `code`
- `language`
- `status`
- `score`
- `submitted_at`

## Usage

### For Admins:
1. Login with admin credentials
2. Create contests with start/end times
3. Add problems to contests with descriptions and sample input/output
4. Monitor participant submissions

### For Participants:
1. Login with participant credentials
2. View available contests (upcoming, running, ended)
3. Select a contest and view problems
4. Write and submit code solutions
5. Track submission status and history

## Security Notes

- Passwords are hashed using bcrypt
- Session management for authentication
- Admin-only routes are protected
- Input validation on forms

## Development Notes

- The code evaluation system is simplified for this demo
- In production, you would need:
  - Proper code judging system
  - File upload handling for larger code
  - More robust error handling
  - Unit tests
  - Production database configuration

## Troubleshooting

### Database Connection Issues
1. Ensure MySQL server is running
2. Check database credentials in `server/app.js`
3. Verify the database was created properly

### Port Already in Use
- Change the PORT in `server/app.js` or set environment variable:
```bash
PORT=3001 npm start
```

### Session Issues
- Clear browser cookies if login issues persist
- Check session secret key in production

## License

MIT License - feel free to use for educational purposes.
