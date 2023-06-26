import { MongoClient } from 'mongodb';
import {
  ObjectId
} from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [ // Aggregation pipeline to calculate average rating and number of reviews
  {
    '$match': {
      'product': new ObjectId('64848cd43d658fb010520241') // Match documents with a specific product ObjectId
    }
  }, {
    '$group': {
      '_id': null, 
      'averageRating': {
        '$avg': '$rating' // Calculate the average rating using the 'rating' field
      }, 
      'numOfReviews': {
        '$sum': 1 // Count the number of reviews
      }
    }
  }
];

const client = await MongoClient.connect( // Connect to the MongoDB server
  '',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const coll = client.db('SILKLAND').collection('reviews'); // Access the 'reviews' collection in the 'SILKLAND' database
const cursor = coll.aggregate(agg); // Execute the aggregation query and obtain a cursor
const result = await cursor.toArray(); // Convert the cursor to an array of results
await client.close(); // Close the MongoDB connection