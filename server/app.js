const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'contest_system'
};

let db;

async function initDB() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied. Admin only.');
    }
}

// Authentication routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [users] = await db.execute(
            'SELECT * FROM Users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        const isValidPassword = (password === user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            email: user.email
        };
        
        res.json({ success: true, user: req.session.user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Contest routes
app.get('/api/contests', async (req, res) => {
    try {
        const [contests] = await db.execute(
            'SELECT * FROM Contests ORDER BY start_time DESC'
        );
        res.json(contests);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/contests', isAdmin, async (req, res) => {
    try {
        const { title, description, start_time, end_time } = req.body;
        const created_by = req.session.user.user_id;
        
        const [result] = await db.execute(
            'INSERT INTO Contests (title, description, start_time, end_time, created_by) VALUES (?, ?, ?, ?, ?)',
            [title, description, start_time, end_time, created_by]
        );
        
        res.json({ success: true, contest_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Problem routes
app.get('/api/contests/:contestId/problems', async (req, res) => {
    try {
        const { contestId } = req.params;
        const [problems] = await db.execute(
            'SELECT * FROM Problems WHERE contest_id = ?',
            [contestId]
        );
        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/problems', isAdmin, async (req, res) => {
    try {
        const { contest_id, title, description, input_format, output_format, sample_input, sample_output, points } = req.body;
        
        const [result] = await db.execute(
            'INSERT INTO Problems (contest_id, title, description, input_format, output_format, sample_input, sample_output, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [contest_id, title, description, input_format, output_format, sample_input, sample_output, points]
        );
        
        res.json({ success: true, problem_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Submission routes
app.post('/api/submissions', isAuthenticated, async (req, res) => {
    try {
        const { problem_id, contest_id, code, language } = req.body;
        const user_id = req.session.user.user_id;
        
        // For simplicity, we'll mark submissions as pending
        // In a real system, you'd have a judge system here
        const [result] = await db.execute(
            'INSERT INTO Submissions (user_id, problem_id, contest_id, code, language, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, problem_id, contest_id, code, language, 'pending']
        );
        
        res.json({ success: true, submission_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/submissions/:userId', isAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (req.session.user.role !== 'admin' && req.session.user.user_id != userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // We use LEFT JOIN so that if a contest title is missing, 
        // the submission still shows up with the ID.
        const [submissions] = await db.execute(`
            SELECT 
                s.*, 
                p.title AS problem_title, 
                COALESCE(c.title, CONCAT('Contest #', s.contest_id)) AS contest_title 
            FROM Submissions s 
            LEFT JOIN Problems p ON s.problem_id = p.problem_id 
            LEFT JOIN Contests c ON s.contest_id = c.contest_id 
            WHERE s.user_id = ? 
            ORDER BY s.submitted_at DESC
        `, [userId]);
        
        res.json(submissions);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User routes
app.get('/api/current-user', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.json(null);
    }
});

// Serve frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/participant', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/participant.html'));
});

// Start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
