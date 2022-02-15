const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema } = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const methodOverride = require('method-override');
const Campground = require('./model/campground');
const ExpressError = require('./utils/ExpressError');
const { join } = require('path/posix');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
    console.log('Database Connected');
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, resp, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/', (req, resp) => {
    resp.render('home');
});
app.get('/campgrounds', catchAsync(async (req, resp) => {
    const campgrounds = await Campground.find({});
    resp.render('campgrounds/index', { campgrounds })
}));
app.get('/campgrounds/new', (req, resp) => {

    resp.render('campgrounds/new');
});
app.post('/campgrounds', validateCampground, catchAsync(async (req, resp) => {
    
    const campground = new Campground(req.body.campground);
    await campground.save();
    resp.redirect(`/campgrounds/${campground._id}`);
}));
app.get('/campgrounds/:id', catchAsync(async (req, resp) => {
    const campground = await Campground.findById(req.params.id);
    resp.render('campgrounds/show', { campground });
}));
app.get('/campgrounds/:id/edit', catchAsync(async (req, resp) => {
    const campground = await Campground.findById(req.params.id);
    resp.render('campgrounds/edit', { campground });
}));
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, resp) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    resp.redirect(`/campgrounds/${campground._id}`);
}));
app.delete('/campgrounds/:id', catchAsync(async (req, resp) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    resp.redirect(`/campgrounds`);
}));

app.all('*', (req, resp, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, resp, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Something went wrong";
    }
    resp.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})