const bodyParser = require('body-parser');
const express = require('express');
// const morgan = require('morgan');
const mongoose = require('mongoose');

// Why is this needed?
mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Post } = require('./models');

const app = express();
app.use(bodyParser.json());

// const blogPostRouter = require('./blogPostRouter');

// app.use(morgan('common'));
// app.use('/blog-posts', blogPostRouter);

app.get('/blog-posts', (req, res) => {
    Post
        .find()
        .limit(10)
        // .exec()
        // Where can I define 'blogposts'? Why does the example just show 'restaurants', but does not define it?
        // Answer: blogposts is the name of my collection, but why is it not defined?
        .then(blogposts => {
            console.log(blogposts);
            res.json({
                blogposts: blogposts.map(
                    (blogpost) => blogpost.apiRepr())
            });
        })
        .catch(
            err => {
                console.error(err);
                res.status(500).json({
                    message: 'Internal servor error'
                });

            });

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
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
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

module.exports = { app, runServer, closeServer };