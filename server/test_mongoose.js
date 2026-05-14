import mongoose from 'mongoose';
import Lecture from './src/models/lecture.model.js';

async function test() {
    await mongoose.connect('mongodb://localhost:27017/elearning');
    const moduleIdStr = '69ee131269627c265d8229d1';
    
    console.log("Testing string filter:");
    const res1 = await Lecture.find({ moduleId: moduleIdStr });
    console.log("res1 length:", res1.length);
    
    console.log("Testing ObjectId filter:");
    const res2 = await Lecture.find({ moduleId: new mongoose.Types.ObjectId(moduleIdStr) });
    console.log("res2 length:", res2.length);
    
    mongoose.disconnect();
}
test();
