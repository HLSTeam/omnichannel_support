/**
 * Test script to verify Elasticsearch response handling
 * This script simulates the actual Elasticsearch response format
 */

// Sample Elasticsearch response based on your provided data
const sampleElasticsearchResponse = {
    "took": 146,
    "timed_out": false,
    "_shards": {
        "total": 17,
        "successful": 17,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 28,
            "relation": "eq"
        },
        "max_score": null,
        "hits": [
            {
                "_index": "nine-tech-topup-log-2025.09",
                "_id": "3TS_N5kBqsCi0ZspMEqs",
                "_score": null,
                "_source": {
                    "@timestamp": "2025-09-11T14:48:19.8905881+07:00",
                    "level": "Information",
                    "messageTemplate": "[GATEWAY] [{TransCode}] [{ReferenceCode} TOPUP_REQUEST_END TotalDuration={TotalDuration}ms ErrorCode={ErrorCode} Message={Message} EndTime={EndTime}",
                    "message": "[GATEWAY] [\"253727604\"] [\"NT25091100029162\" TOPUP_REQUEST_END TotalDuration=3275ms ErrorCode=\"01\" Message=\"Bạn đã nạp tiền thành công cho số 0943257049 số tiền 10000. Mã GD NT25091100029162\" EndTime=09/11/2025 14:48:19",
                    "fields": {
                        "TransCode": "253727604",
                        "ReferenceCode": "NT25091100029162",
                        "TotalDuration": 3275,
                        "ErrorCode": "01",
                        "Message": "Bạn đã nạp tiền thành công cho số 0943257049 số tiền 10000. Mã GD NT25091100029162",
                        "EndTime": "2025-09-11T14:48:19.8905502+07:00",
                        "SourceContext": "Topup.Gw.Interface.Services.TopupService",
                        "SpanId": "2781c2f7d2302bfa",
                        "TraceId": "58b9a432eff592ab7fe074094e8c4d20",
                        "ParentId": "2be3e575441bd0fa",
                        "ConnectionId": "0HNF2C79NCFEA",
                        "RequestId": "0HNF2C79NCFEA:0000001A",
                        "RequestPath": "/api/v1/gateway/topup",
                        "Application": "gateway"
                    }
                },
                "sort": [
                    1757576899890
                ]
            },
            {
                "_index": "nine-tech-topup-log-2025.09",
                "_id": "7TS_N5kBqsCi0ZspM0qf",
                "_score": null,
                "_source": {
                    "@timestamp": "2025-09-11T14:48:19.8889435+07:00",
                    "level": "Information",
                    "messageTemplate": "[WORKER] [{TransCode}] [{TransRef}] WORKER_TOPUP_REQUEST_END TotalDuration={TotalDuration}ms FinalStatus={FinalStatus} Message={Message}",
                    "message": "[WORKER] [\"NT25091100029162\"] [\"253727604\"] WORKER_TOPUP_REQUEST_END TotalDuration=3268ms FinalStatus=\"01\" Message=\"Bạn đã nạp tiền thành công cho số 0943257049 số tiền 10000. Mã GD NT25091100029162\"",
                    "fields": {
                        "TransCode": "NT25091100029162",
                        "TransRef": "253727604",
                        "TotalDuration": 3268,
                        "FinalStatus": "01",
                        "Message": "Bạn đã nạp tiền thành công cho số 0943257049 số tiền 10000. Mã GD NT25091100029162",
                        "SourceContext": "Topup.Worker.Components.WorkerProcess.WorkerProcess",
                        "Application": "worker"
                    }
                },
                "sort": [
                    1757576899888
                ]
            }
        ]
    }
};

/**
 * Test the formatLogResults function with the sample response
 */
function testFormatLogResults() {
    console.log('Testing formatLogResults function with sample Elasticsearch response...\n');
    
    // Simulate the formatLogResults function from elasticsearch.service.js
    const formatLogResults = (hits, systemId) => {
        return hits.map((hit, index) => {
            const source = hit._source;
            const timestamp = source['@timestamp'] || new Date().toISOString();
            
            // Extract fields from the response structure
            const fields = source.fields || {};
            
            return {
                id: hit._id || `es_log_${systemId}_${index}`,
                timestamp: timestamp,
                level: (source.level || 'INFO').toLowerCase(),
                type: fields.Application || fields.SourceContext || 'application',
                message: source.message || source.messageTemplate || 'No message',
                source: fields.Application || fields.SourceContext || 'elasticsearch',
                systemId: source.system_id || systemId,
                host: fields.host,
                environment: source.environment,
                context: fields,
                error: fields.error,
                _index: hit._index,
                _score: hit._score
            };
        });
    };
    
    // Process the sample response
    const formattedLogs = formatLogResults(sampleElasticsearchResponse.hits.hits, 'nine-tech-topup');
    
    console.log('Formatted logs:');
    formattedLogs.forEach((log, index) => {
        console.log(`\n${index + 1}. Log Entry:`);
        console.log(`   ID: ${log.id}`);
        console.log(`   Timestamp: ${log.timestamp}`);
        console.log(`   Level: ${log.level}`);
        console.log(`   Type: ${log.type}`);
        console.log(`   Source: ${log.source}`);
        console.log(`   Message: ${log.message}`);
        console.log(`   System ID: ${log.systemId}`);
        console.log(`   Context keys: ${Object.keys(log.context).join(', ')}`);
    });
    
    console.log('\n✅ Test completed successfully!');
    return formattedLogs;
}

// Run the test
testFormatLogResults();