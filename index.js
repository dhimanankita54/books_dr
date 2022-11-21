require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const Books = require('./books.model');
const User = require('./member.model');

const app = express();
app.use(express.json());
app.use(cors());

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cookieparser());

mongoose.connect('mongodb://127.0.0.1:27017/books_dir');

//books APIs--------------------------------------------------------------------------

app.post('/books', (req, res) => {
    const book = new Books(req.body);

    book.save((err, doc) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ success: false });
        }
        res.status(200).json({
            succes: true,
            book: doc
        });
    })
});

app.get('/books', (req, res) => {

    const limit = req.query.limit;
    const page = req.query.page || 1;
    const start = (limit * page) - limit;

    Books.find((err, books) => {
        if (err) {
            res.send(err);
        } else {
            res.send(books);
        }
    }).skip(start).limit(limit)
});

app.get('/books/:id', (req, res) => {
    Books.find({ _id: req.params.id }, (err, books) => {
        if (err) {
            res.send(err);
        } else {
            res.send(books);
        }
    })
});

app.put('/books/:id/return', async (req, res) => {
    const id = req.params.id;
    const exist = await Books.findOne({ _id: id });
    if (!exist) return res.send("Book does not exist!");

    const updatedField = (val, prev) => !val ? prev : val;

    const updated = {
        ...exist, status: updatedField('Available', exist.status)
    }

    await Books.updateOne(
        { _id: id },
        {
            $set: {
                status: updated.status
            }   
        }
    );
    res.sendStatus(200);
});

app.put('/books/:id/issue', async (req, res) => {
    const id = req.params.id;

    const exist = await Books.findOne({ _id: id });
    if (!exist) return res.send("Book does not exist!");

    const updatedField = (val, prev) => !val ? prev : val;

    const updated = {
        ...exist, status: updatedField('Issued', exist.status)
    }

    await Books.updateOne(
        { _id: id },
        {
            $set: {
                status: updated.status
            }
        }
    );
    res.sendStatus(200);
})

app.delete('/books/:id', (req, res) => {
    Books.deleteOne({ _id: req.params.id }, (err) => {
        if (!err) {
            res.send("Book deleted successfully!");
        }
    })
});

//---------------------------------------------------------------------

//Member API---------------------------------------------------------------------------

app.post('/member', (req, res) => {
    const user = new User(req.body);
    user.save((err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.send(user);
        }
    })
});

app.get('/members', (req, res) => {
    User.find((err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.send(user);
        }
    })
});

app.get('/members/:role', (req, res) => {
    User.find({ role: req.params.role }, (err, user) => {
        if (err) {
            res.send(err);
        } else {
            res.send(user);
        }
    })
});

app.put('/member/:id', async (req, res) => {
    const id = req.params.id;
    const { name, role, email } = req.body;

    const exist = await User.findOne({ _id: id });
    if (!exist) return res.send("Member does not exist!");

    const updatedField = (val, prev) => !val ? prev : val;

    const updated = {
        ...exist,
        name: updatedField(name, exist.name),
        role: updatedField(role, exist.role),
        email: updatedField(email, exist.email)
    }

    await User.updateOne(
        { _id: id },
        {
            $set: {
                name: updated.name,
                role: updated.role,
                email: updated.email
            }
        }
    );
    res.sendStatus(200);
});

app.delete('/member/:id', (req, res) => {
    User.deleteOne({ _id: req.params.id }, (err) => {
        if (!err) {
            res.send("User deleted successfully!");
        }
    })
});

//-----------------------------------------------------------------------------------------


const PORT = process.env.PORT || 8080;

app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    }
    console.log(`connected at ${PORT}`)
})