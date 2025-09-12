import elasticsearchService from './src/services/elasticsearch.service.js';

async function testElasticsearchLogs() {
    console.log('Testing Elasticsearch log search with updated format...');
    
    // Wait a moment for the service to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if connected
    if (elasticsearchService.isConnected) {
        console.log('✅ Elasticsearch is connected');
        
        // Try a log search with the updated format
        try {
            const result = await elasticsearchService.searchLogs({
                systemId: 'nine-tech-topup',
                size: 5,
                timeRange: 'last_24_hours'
            });
            
            console.log('✅ Elasticsearch log search test completed');
            console.log('Total logs found:', result.data.totalLogs);
            console.log('Sample log entries:');
            
            // Display first 3 log entries
            result.data.logs.slice(0, 3).forEach((log, index) => {
                console.log(`${index + 1}. [${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`);
                console.log(`   Source: ${log.source}`);
                console.log(`   Type: ${log.type}`);
                if (log.context && Object.keys(log.context).length > 0) {
                    console.log(`   Context keys: ${Object.keys(log.context).join(', ')}`);
                }
                console.log('');
            });
        } catch (error) {
            console.error('❌ Elasticsearch log search test failed:', error.message);
        }
    } else {
        console.log('❌ Elasticsearch is not connected');
    }
    
    process.exit(0);
}

testElasticsearchLogs();