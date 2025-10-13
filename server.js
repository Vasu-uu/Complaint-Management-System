const express = require('express');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'a-very-strong-and-long-secret-key-for-sessions',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 } 
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_mysql_password', 
    database: 'complaint_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Successfully connected to the MySQL database.');
});

const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized: Please sign in.' });
    }
    next();
};

const checkAdmin = (req, res, next) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
    next();
};


app.post('/api/auth/signin', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Database error during sign-in:', err);
            return res.status(500).json({ message: 'Server error during sign-in.' });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.userId = user.id;
            req.session.role = user.role;
            res.json({ message: 'Sign-in successful!', role: user.role });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    });
});

app.post('/api/auth/signout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not sign out.' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Signed out successfully.' });
    });
});

app.post('/api/complaints', checkAuth, (req, res) => {
    const id = uuidv4();
    const { category, description } = req.body;
    const userId = req.session.userId;
    const sql = 'INSERT INTO complaints (id, userId, Category, Description) VALUES (?, ?, ?, ?)';
    db.query(sql, [id, userId, category, description], (err) => {
        if (err) {
            console.error('Error submitting complaint:', err);
            return res.status(500).json({ message: 'Failed to submit complaint.' });
        }
        res.status(201).json({ message: 'Complaint submitted successfully!' });
    });
});

app.get('/api/complaints/active', checkAuth, checkAdmin, (req, res) => {
    const sortOrder = req.query.sort === 'old' ? 'ASC' : 'DESC';
    const sql = `
        SELECT c.id, c.Category, c.Description, c.submissionDate, c.Status, c.resolutionMessage, u.fullName 
        FROM complaints c
        JOIN users u ON c.userId = u.id
        WHERE TRIM(c.Status) IN ('Submitted', 'In Review')
        ORDER BY c.submissionDate ${sortOrder}
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching admin complaints:', err);
            return res.status(500).json({ message: 'Failed to fetch complaints.' });
        }
        res.json(results);
    });
});

app.get('/api/complaints/history', checkAuth, checkAdmin, (req, res) => {
    const sortOrder = req.query.sort === 'old' ? 'ASC' : 'DESC';
    const sql = `
        SELECT c.id, c.Category, c.Description, c.submissionDate, c.Status, c.resolutionMessage, u.fullName 
        FROM complaints c
        JOIN users u ON c.userId = u.id
        WHERE TRIM(c.Status) = 'Resolved'
        ORDER BY c.submissionDate ${sortOrder}
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching history complaints:', err);
            return res.status(500).json({ message: 'Failed to fetch history.' });
        }
        res.json(results);
    });
});


app.get('/api/user/complaints', checkAuth, (req, res) => {
    const userId = req.session.userId;
    const sql = 'SELECT * FROM complaints WHERE userId = ? ORDER BY submissionDate DESC';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user complaints:', err);
            return res.status(500).json({ message: 'Failed to fetch your complaints.' });
        }
        res.json(results);
    });
});

app.put('/api/complaints/:id', checkAuth, checkAdmin, (req, res) => {
    const complaintId = req.params.id;
    const { status, resolutionMessage } = req.body;
    const sql = 'UPDATE complaints SET Status = ?, resolutionMessage = ? WHERE id = ?';
    db.query(sql, [status, resolutionMessage, complaintId], (err, result) => {
        if (err) {
            console.error('Error updating status:', err);
            return res.status(500).json({ message: 'Failed to update status.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Complaint not found.' });
        }
        res.json({ message: 'Status updated successfully!' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});