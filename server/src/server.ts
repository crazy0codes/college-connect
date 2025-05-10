import express from 'express';
import cors from 'cors';
import cloudinary from './config/cloudinary.config';
import http from 'http';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { Server } from 'socket.io';

import userRoute from './routes/authRoute';
import setUpSocket from './socket/socketHandler';

const app = express();
const server = http.createServer(app);
const port = 3001;


dotenv.config();
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});



app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


setUpSocket(io);


/* <----- Routes ------> */

app.get('/', (req: Request, res: Response) => {
  res
  .status(200)
  .send('Hello World!');
  return;
});

app.use('/api/auth', userRoute);

app.use((req: Request, res: Response) => {
  res.status(404).send('404 Not Found!');
});

server.listen(port, (error?: Error) => {
    if (error) {
        console.error(`Error starting server: ${error}`);
        return;
    }
    console.log(`Server is running at http://localhost:${port}`);
});