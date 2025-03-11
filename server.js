const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = 5000;

// API to Login User
app.post('/login', (req, res) => {
    const { name, password } = req.body;
    db.get(`SELECT * FROM users WHERE name = ? AND password = ?`, [name, password], (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else if (!row) res.status(401).json({ error: "Invalid credentials" });
        else res.json({ id: row.id, name: row.name, role: row.role });
    });
});

// API to Get Available Books
app.get('/books', (req, res) => {
    db.all(`SELECT * FROM books WHERE available = 1`, [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

// API to Issue a Book
app.post('/issue-book', (req, res) => {
    const { user_id, book_id } = req.body;
    const issueDate = new Date().toISOString().split('T')[0];
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 15);
    const formattedReturnDate = returnDate.toISOString().split('T')[0];

    db.run(`INSERT INTO transactions (user_id, book_id, issue_date, return_date) VALUES (?, ?, ?, ?)`, 
        [user_id, book_id, issueDate, formattedReturnDate], 
        function(err) {
            if (err) res.status(500).json({ error: err.message });
            else {
                db.run(`UPDATE books SET available = 0 WHERE id = ?`, [book_id]);
                res.json({ success: true, transaction_id: this.lastID });
            }
    });
});

// API to Return a Book
app.post('/return-book', (req, res) => {
    const { transaction_id, finePaid } = req.body;

    db.run(`UPDATE transactions SET fine = ?, return_date = date('now') WHERE id = ?`, 
        [finePaid, transaction_id], 
        function(err) {
            if (err) res.status(500).json({ error: err.message });
            else res.json({ success: true });
        }
    );
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
