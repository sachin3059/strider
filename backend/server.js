import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRouter.js';


// app config
const app = express();
const PORT = process.env.PORT || 3000;
connectDB();


// middlewares
app.use(express.json());
app.use(cors());


// api endpoints

app.use('/api/user', userRouter);
// localhost:4000/api/user/register

app.get('/', (req, res) => {
    res.send('api working')
});



// server listen

app.listen(PORT, () => {
    console.log('server started at port', PORT)
}); 


