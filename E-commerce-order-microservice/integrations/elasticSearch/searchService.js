const esClient = require('./client');
const { INDEX_NAME } = require('./indexManager');

const searchProducts = async (query) => {
  try {
    const filters = [];

    if (query.title) {
      filters.push({
        match: { title: { query: query.title, fuzziness: 'AUTO' } },
      });
    }
    if (query.description) {
      filters.push({
        match: { description: { query: query.description, fuzziness: 'AUTO' } },
      });
    }
    if (query.category) {
      filters.push({
        match: { category: { query: query.category, fuzziness: 'AUTO' } },
      });
    }

    if (query.price && (query.price.min || query.price.max)) {
      filters.push({
        range: {
          price: {
            ...(query.price.min ? { gte: query.price.min } : {}),
            ...(query.price.max ? { lte: query.price.max } : {}),
          },
        },
      });
    }

    const queryBody = filters.length > 0
      ? { query: { bool: { must: filters } } }
      : { query: { match_all: {} } };

    const response = await esClient.search({
      index: INDEX_NAME,
      body: queryBody,
    });

    return response.hits.hits.map((hit) => hit._source);
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

module.exports = { searchProducts };
