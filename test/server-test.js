const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Blog Post', function() {
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should retrieve blog post on GET', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.should.be.a('object');
                res.body.length.should.be.at.least(1);

                const expectedKeys = ['title', 'content', 'author', 'publishDate', 'id'];

                res.body.forEach(function(item) {
                    item.should.be.a('object');
                    item.should.include.keys(expectedKeys);
                });
            });
    });

    it('should add a new blog post on POST', function() {
        const newPost = {
            title: 'Working with Integration',
            author: 'HMD',
            publishDate: '04/01/2016',
            content: 'Cupcake ipsum dolor sit. Amet tootsie roll fruitcake cupcake'
        };
        return chai.request(app)
            .post('/blog-posts')
            .send(newPost)
            .then(function(res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('title', 'author', 'publishDate', 'content', 'id');
                res.body.id.should.not.be.null;
                res.body.should.deep.equal(Object.assign(newPost, { id: res.body.id }));
            });
    });

    it('should update blog posts on PUT', function() {
        const updateData = {
            title: 'We are adding something new',
            author: 'MRRM',
            publishDate: '05/02/2016',
            content: 'Bacon ipsum dolor amet ea eu leberkas ham venison burgdoggen dolore excepteur in dolore ipsum anim drumstick boudin'
        };

        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                updateData.id = res.body[0].id;
                return chai.request(app)
                    .put(`/blog-posts/${updateData.id}`)
                    .send(updateData);
            })
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.deep.equal(updateData);
            });
    });

    it('should delete blog post on DELETE', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                return chai.request(app)
                    .delete(`/blog-posts/${res.body[0].id}`);
            })
            .then(function(res) {
                res.should.have.status(204);
            });
    });
});