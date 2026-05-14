import mongoose from 'mongoose';
import Module from './src/models/module.model.js';
import Lecture from './src/models/lecture.model.js';

async function check() {
    await mongoose.connect('mongodb://localhost:27017/elearning');
    const lectures = await Lecture.find({});
    console.log("TOTAL LECTURES:", lectures.length);
    console.log(lectures.map(l => ({ title: l.title, moduleId: l.moduleId, isPublished: l.isPublished })));
    mongoose.disconnect();
}
check();
