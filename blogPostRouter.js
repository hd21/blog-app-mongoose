const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const { BlogPosts } = require('./models');

BlogPosts.create("Title", "Content", "Author", "Date");
BlogPosts.create("My Life Be Like", "Cash me ousside - how bow dah?", "Unknown", "01/23/2017");

router.get('/', (req, res) => {
    res.json(BlogPosts.get());
});

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author', 'publishDate'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `You are missing the \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }
    const post = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
    res.status(201).json(post);
});

// Delete recipes (by id)!
router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    console.log(`Deleted the post \`${req.params.id}\``);
    res.status(204).end();
});

router.put('/:id', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author', 'publishDate', 'id'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `You are missing the \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }
    if (req.params.id !== req.body.id) {
        const message = (
            `Request path id (${req.params.id}) and request body id `
            `(${req.body.id}) do not match`);
        console.error(message);
        return res.status(400).send(message);
    }
    console.log(`Updating blog post \`${req.params.id}\``);
    const updatedPost = BlogPosts.update({
        id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        publishDate: req.body.publishDate
    });
    res.status(204).json(updatedPost);
})

module.exports = router;