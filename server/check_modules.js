import mongoose from 'mongoose';
import Module from './src/models/module.model.js';

async function check() {
    await mongoose.connect('mongodb://localhost:27017/elearning');
    const modules = await Module.find({ courseId: '69ee0d0a69627c265d8227f4' });
    console.log(modules.map(m => ({ id: m._id, title: m.title })));
    mongoose.disconnect();
}
check();
