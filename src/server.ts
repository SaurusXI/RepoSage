import express from 'express';
import { controller } from './main.js';

const app = express();

app.post('/process', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({
            message: 'Request body needs to be like { url: "..." }',
        });
    }
    const out = controller.processPR(url);
    return res.status(200).json(out);
});

app.get('/recommendation', async (req, res) => {
    const out = controller.getRecommendation();
    return res.json(out);
});

app.get('/changelog', async (req, res) => {
    const out = controller.getChangelog();
    return res.json(out);
});

app.get('/description', async (req, res) => {
    const out = controller.getSummary();
    return res.json(out);
});

app.get('/test-cases', async (req, res) => {
    const out = controller.getTCs();
    return res.json(out);
});

app.listen(3000);
