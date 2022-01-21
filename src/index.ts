import express from 'express';

import * as opentelemetry from '@opentelemetry/api';

import { BasicTracerProvider, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

import { MeterProvider, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics-base';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const port = 8089;

const tracerProvider = new BasicTracerProvider();
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(
    new OTLPTraceExporter({
        url: 'http://tempo-otlp/v1/traces'
    })
));
tracerProvider.register();
const tracer = opentelemetry.trace.getTracer('myTracer');


const meter = new MeterProvider({
    exporter: new PrometheusExporter({
        port: 8090,
    }),
    interval: 1000,
}).getMeter('myMeter');

const boundInstrumenets = new Map();

const app = express();

function doWork(parentSpan: opentelemetry.Span) {
    const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan);
    const span = tracer.startSpan('doWork', undefined, ctx);
    for (let i = 0; i < 1e9; i++) {
        Math.sqrt(i);
    }
    span.end();
}

app.use((req, res, next) => {
    if (!boundInstrumenets.has(req.path)) {
        const requestCount = meter.createCounter(`requests${req.path.replace('/', '_')}`, {
            description: `Count requests for ${req.path}`,
        });
        boundInstrumenets.set(req.path, requestCount);
    }

    boundInstrumenets.get(req.path).add(1);

    const span = tracer.startSpan('main');
    doWork(span);
    console.log(span.spanContext().traceId);
    span.end();

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
