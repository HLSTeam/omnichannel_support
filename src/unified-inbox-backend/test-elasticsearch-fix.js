import elasticsearchService from './src/services/elasticsearch.service.js';

async function testElasticsearchFix() {
    console.log('Testing Elasticsearch connection with API version fix...');
    
    // Wait a moment for the service to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if connected
    if (elasticsearchService.isConnected) {
        console.log('✅ Elasticsearch is connected');
        
        // Try a simple search
        try {
            const result = await elasticsearchService.searchLogs({
                systemId: 'test-system',
                size: 1
            });
            console.log('✅ Elasticsearch search test successful:', result.success);
        } catch (error) {
            console.error('❌ Elasticsearch search test failed:', error.message);
        }
    } else {
        console.log('❌ Elasticsearch is not connected');
    }
    
    process.exit(0);
}

testElasticsearchFix();