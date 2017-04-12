const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

// Required for testing (will be done later) const morgan = require('morgan');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Post } = require('./models');

const app = express();
app.use(bodyParser.json());

// const blogPostRouter = require('./blogPostRouter');
// app.use(morgan('common')); app.use('/blog-posts', blogPostRouter);

app.get('/blog-posts', (req, res) => {
    Post
        .find()
        .limit(10)
        // .exec()
        .then(blogposts => {
            console.log(blogposts);
            res.json({
                blogposts: blogposts.map((blogpost) => blogpost.apiRepr())
            });
        })
        .catch(err => {
            console.error(err);
            res
                .status(500)
                .json({ message: 'Internal servor error' });

        });

});

// request by ID recall that when requesting a single post by ID, blogpost
// should be singular
app.get('/blog-posts/:id', (req, res) => {
    Post
        .findById(req.params.id)
        .then(blogpost => res.json(blogpost.apiRepr()))
        .catch(err => {
            console.error(err);
            res
                .status(500)
                .json({ message: 'Internal server error' })
        })
});

app.post('/blog-posts', (req, res) => {
    console.log(req.body);
    const requiredItems = ['title', 'content', 'author'];
    for (let i = 0; i < requiredItems.length; i++) {
        const item = requiredItems[i];
        if (!(item in req.body)) {
            const message = `You are missing \`${item}\` in your request body`
            console.error(message);
            return res
                .status(400)
                .send(message);
        }
    }

    Post
        .create({
            title: req.body.title,
            content: req.body.content,
            author: {
                firstName: req.body.author.firstName,
                lastName: req.body.author.lastName
            }
        })
        .then(blogpost => res.status(201).json(blogpost.apiRepr()))
        .catch(err => {
            console.error(err);
            res
                .status(500)
                .json({ message: 'Internal server error' })
        });

});

app.put('/blog-posts/:id', (req, res) => {
    if (!req.params.id) {
        // How is req.body.id undefined??
        console.log(req.params.id);
        const message = (
            `Request path ID (${req.params.id}) is not available`);
        console.error(message);
        res.status(400).json({ message: message });
    }

    const updatePost = {};
    const changeableItems = ['title', 'content', 'author'];

    changeableItems.forEach(item => {
        if (item in req.body) {
            updatePost[item] = req.body[item];
        }
    });

    Post
        .findByIdAndUpdate(req.params.id, { $set: updatePost })
        .then(blogpost => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal server error' }));

});

app.delete('/blog-posts/:id', (req, res) => {
    Post
        .findByIdAndRemove(req.params.id)
        .then(blogpost => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

// Throw error status if user makes a request to a non-existent endpoint
app.use('*', function(req, res) {
    res.status(404).json({ message: 'Not found' });
});

let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {

    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            }).on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

function closeServer() {
    return mongoose
        .disconnect()
        .then(() => {
            return new Promise((resolve, reject) => {
                console.log('Closing server');
                server.close(err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {
    app,
    runServer,
    closeServer
};