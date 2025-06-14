const esClient = require('./client');
const { INDEX_NAME } = require('./indexManager');
const ProductCache = require('../../models/productCacheModel');

const bootstrapElasticsearchIndex = async () => {
  try {
    const products = await ProductCache.find({});
    console.log(`Found ${products.length} products in MongoDB.`);

    for (const product of products) {
      const productId = product._id.toString();

      const exists = await esClient.exists({
        index: INDEX_NAME,
        id: productId,
      });

      if (exists.body) {
        console.log(`Product ID: ${productId} already exists in Elasticsearch. Skipping...`);
        continue;
      }

      await esClient.index({
        index: INDEX_NAME,
        id: productId,
        body: {
          title: product.title,
          description: product.description,
          category_id: product.category_id,
          category: product.category,
          price: product.price,
          quantity: product.quantity,
          image: product.image,
          seller: product.seller,
          updatedAt: product.updatedAt,
        },
      });

      console.log(`Indexed product ID: ${productId} to Elasticsearch.`);
    }
    console.log('Bootstrap indexing completed.');
  } catch (error) {
    console.error('Error bootstrapping Elasticsearch index:', error);
  }
};

module.exports = bootstrapElasticsearchIndex;
