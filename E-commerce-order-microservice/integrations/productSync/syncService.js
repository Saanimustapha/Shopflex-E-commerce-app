const mongoose = require('mongoose');
const { initializeModels } = require('./productModels');
const { handleCacheSync, performInitialSync, populateProductCacheData } = require('./helpers');
const ProductCache = require('../../models/productCacheModel');
const { esClient } = require('../elasticsearchSync');

const INDEX_NAME = process.env.ELASTICSEARCH_PRODUCT_INDEX || 'order_microservice_products';

const syncProductCache = async () => {
  try {
    // Initialize Product and Category models
    const { ProductModel, CategoryModel } = initializeModels();

    console.log('Performing initial sync...');
    await performInitialSync(ProductModel, CategoryModel, ProductCache);

    console.log('Listening to Product collection for changes...');
    const changeStream = ProductModel.watch([], { fullDocument: 'updateLookup' });

    changeStream.on('change', async (change) => {
      try {
        console.log('Change detected:', change);
        switch (change.operationType) {
          case 'insert':
          case 'update':
            await handleCacheSync(async () => {
              const populatedProduct = await ProductModel.findById(change.fullDocument._id).populate('category_id');
              const cacheData = populateProductCacheData(populatedProduct);

              await ProductCache.updateOne({ _id: populatedProduct._id }, { $set: cacheData }, { upsert: true });
              await esClient.index({
                index: INDEX_NAME,
                id: populatedProduct._id.toString(),
                body: cacheData,
              });
            });
            console.log(`Synchronized product ${change.fullDocument.title}`);
            break;

          case 'delete':
            await handleCacheSync(async () => {
              await ProductCache.deleteOne({ _id: change.documentKey._id });
              await esClient.delete({ index: INDEX_NAME, id: change.documentKey._id.toString() });
            });
            console.log(`Deleted product ID ${change.documentKey._id}`);
            break;

          default:
            console.log('Unrecognized change event:', change.operationType);
        }
      } catch (error) {
        console.error('Error handling change event:', error.message);
      }
    });

    changeStream.on('error', (error) => {
      console.error('Change stream error:', error.message);
    });

    
  } catch (error) {
    console.error('Error starting sync service:', error.message);
  }
};

module.exports = syncProductCache;
