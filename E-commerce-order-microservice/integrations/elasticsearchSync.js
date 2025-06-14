const { initializeProductIndex } = require('./elasticSearch/indexManager');
const bootstrapElasticsearchIndex = require('./elasticSearch/bootstrap');
const startProductChangeStream = require('./elasticSearch/changeStream');

const initializeAndSyncProducts = async () => {
  await initializeProductIndex();
  await bootstrapElasticsearchIndex();
  await startProductChangeStream();
};

module.exports = {
  initializeAndSyncProducts,
};
