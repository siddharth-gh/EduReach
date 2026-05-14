import axios from 'axios';

async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/lectures/69ee131269627c265d8229d1');
        console.log("RESPONSE:", res.data);
    } catch (e) {
        console.error("ERROR:", e.response?.status, e.response?.data);
    }
}
test();
