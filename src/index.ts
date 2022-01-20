import express from 'express';
import { MeterProvider, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics-base';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const port = 8089;

const meter = new MeterProvider({
    exporter: new PrometheusExporter({
        port: 8090,
    }),
    interval: 1000,
}).getMeter('myMeter');

const boundInstrumenets = new Map();

const app = express();

app.use((req, res, next) => {
    if (!boundInstrumenets.has(req.path)) {
        const requestCount = meter.createCounter(`requests${req.path.replace('/', '_')}`, {
            description: `Count requests for ${req.path}`,
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

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
