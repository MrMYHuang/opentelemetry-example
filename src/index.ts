import express from 'express';
const port = 8080;

const app = express();

app.get('/', (req, res) => {
    res.send('Hello.');
});

app.get('/foo', (req, res) => {
    res.send('Hello foo.');
});

app.get('/bar', (req, res) => {
    res.send('Hello bar.');
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
