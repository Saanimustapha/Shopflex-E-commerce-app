const esClient = require('./client');

const INDEX_NAME = process.env.ELASTICSEARCH_PRODUCT_INDEX || 'order_microservice_products';

const initializeProductIndex = async () => {
  try {
    const exists = await esClient.indices.exists({ index: INDEX_NAME });

    if (!exists.body) {
      await esClient.indices.create({
        index: INDEX_NAME,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
          },
          mappings: {
            properties: {
              title: { type: 'text' },
              description: { type: 'text' },
              category_id: { type: 'keyword' },
              category: { type: 'text' },
              price: { type: 'double' },
              quantity: { type: 'integer' },
              image: { type: 'keyword' },
              seller: {
                properties: {
                  id: { type: 'keyword' },
                },
              },
              updatedAt: { type: 'date' },
            },
          },
        },
      });
      console.log(`Index "${INDEX_NAME}" created for products`);
    }
  } catch (error) {
    console.error('Error initializing Elasticsearch index:', error);
  }
};

module.exports = { initializeProductIndex, INDEX_NAME };
