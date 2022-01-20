import express from 'express';
import { MeterProvider, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics-base';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const meter = new MeterProvider({
    exporter: new PrometheusExporter({
        host: '172.16.3.178',
        port: 31837,
    }),
    interval: 1000,
}).getMeter('myMeter');

const boundInstrumenets = new Map();

const app = express();

app.use((req, res, next) => {
    if (!boundInstrumenets.has(req.path)) {
        const labels = { route: req.path };
        const requestCount = meter.createCounter(`${req.path} requests`, {
            description: 'Count requests',
        });
        boundInstrumenets.set(req.path, requestCount);
    }

    boundInstrumenets.get(req.path).add(1);
    next();
});

app.get('/', (req, res) => {
    res.send('Hello.');
});

app.get('/foo', (req, res) => {
    res.send('Hello foo.');
});

app.get('/bar', (req, res) => {
    res.send('Hello bar.');
});

app.listen(8080, () => {
    console.log('Server started on http://localhost:8080');
});
