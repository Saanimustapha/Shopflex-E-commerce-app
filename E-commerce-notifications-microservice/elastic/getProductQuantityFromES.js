const esClient = require('./esClient');

/**
 * Fetches the product quantity from Elasticsearch.
 * @param {string} title - The title of the product to search for.
 * @returns {Promise<number>} - The quantity of the product found in Elasticsearch, or 0 if not found.
 */
const getProductQuantityFromES = async (title) => {
  try {
    const response = await esClient.search({
      index: 'microservice_products',
      body: {
        query: {
          match: {
            title: title,
          },
        },
      },
    });

    // Debugging the response structure
    console.log('Elasticsearch Response:', JSON.stringify(response, null, 2));

    // Access the hits array safely
    const hits = response.hits?.hits || [];

    if (hits.length > 0) {
      const product = hits[0]._source; // Extract the first product from hits
      console.log(`Product found: ${product.title}, Quantity: ${product.quantity}`);
      return product.quantity || 0; // Return the product quantity if found
    } else {
      console.log(`Product with title "${title}" not found in Elasticsearch`);
      return 0; // Default to 0 if no product found
    }
  } catch (error) {
    console.error(`Error fetching product from Elasticsearch: ${error.message}`);
    return 0; // Default to 0 if error occurs
  }
};

module.exports = getProductQuantityFromES;
