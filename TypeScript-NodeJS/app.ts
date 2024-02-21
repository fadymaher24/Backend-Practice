import express from 'express';

import todosRoutes from './routes/todos';


const app = express();

app.use(todosRoutes);

app.listen({ port: 3000 });

