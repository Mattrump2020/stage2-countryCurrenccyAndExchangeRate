import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import morgan from 'morgan';
import path from 'path';
import connectMongoDb from "./src/database/mongodb.js";
import countriesRouter from './src/routes/countries.js';
import statusRouter from './src/routes/status.js';


const app = express();
connectMongoDb();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use('/countries', countriesRouter);
app.use('/status', statusRouter);
app.use('/cache', express.static(path.resolve('cache')));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server running on ${port}`);
})