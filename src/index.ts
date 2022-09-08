import express from 'express';

import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const port = 8080;
const sdk = new opentelemetry.NodeSDK({
    traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
    instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();

const sdk2 = new opentelemetry.NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: 'http://tempo.loki:4318/v1/traces'
    }),
    instrumentations: [getNodeAutoInstrumentations()]
});

sdk2.start();

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
