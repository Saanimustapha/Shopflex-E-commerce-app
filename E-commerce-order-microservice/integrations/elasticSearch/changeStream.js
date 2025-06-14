const mongoose = require('mongoose');
const esClient = require('./client');
const { INDEX_NAME } = require('./indexManager');

const startProductChangeStream = async () => {
  const connection = mongoose.connection;

  connection.once('open', () => {
    console.log('MongoDB connected for product change streams.');

    const changeStream = connection.collection('productcaches').watch();

    changeStream.on('change', async (change) => {
      try {
        const { operationType, documentKey, fullDocument } = change;

        if (operationType === 'insert' || operationType === 'update') {
          await esClient.index({
            index: INDEX_NAME,
            id: documentKey._id,
            body: {
              title: fullDocument.title,
              description: fullDocument.description,
              category_id: fullDocument.category_id,
              category: fullDocument.category,
              price: fullDocument.price,
              quantity: fullDocument.quantity,
              image: fullDocument.image,
              seller: fullDocument.seller,
              updatedAt: fullDocument.updatedAt,
            },
          });
          console.log(`Product ${documentKey._id} indexed/updated in Elasticsearch.`);
        } else if (operationType === 'delete') {
          await esClient.delete({
            index: INDEX_NAME,
            id: documentKey._id,
          });
          console.log(`Product ${documentKey._id} deleted from Elasticsearch.`);
        }
      } catch (error) {
        console.error('Error syncing product change to Elasticsearch:', error);
      }
    });

    console.log('Change stream listening for product updates.');
  });
};

module.exports = startProductChangeStream;
