const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Why is this needed?
mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Post } = require('./models');

const app = express();
app.use(bodyParser.json());

const blogPostRouter = require('./blogPostRouter');

app.use(morgan('common'));
app.use('/blog-posts', blogPostRouter);