import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

/** /
const sdk = new opentelemetry.NodeSDK({
    traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
    instrumentations: [getNodeAutoInstrumentations()]
});
/**/

/**/
const sdk = new opentelemetry.NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: 'http://tempo.loki:4318/v1/traces'
    }),
    instrumentations: [getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-http": {
            applyCustomAttributesOnSpan: (span, req, res) => {
                span.setAttribute('service.name', 'tempo-test');
            }
        }
    })]
});
/**/

sdk.start();

