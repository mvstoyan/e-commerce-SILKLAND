const mongoose = require('mongoose');
// Define the ReviewSchema
const ReviewSchema = mongoose.Schema( 
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please provide review title'],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review text'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true }
);

// Create an index on 'product' and 'user' to ensure unique reviews per product-user combination
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate the average rating and number of reviews for a specific product
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  // Perform an aggregation to calculate the average rating and number of reviews
  const result = await this.aggregate([
    { $match:{ product: productId } },
    {
        $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            numOfReviews: { $sum: 1 },
        },
    },
  ]);
  console.log(result);
  try { // Update the 'averageRating' and 'numOfReviews' fields in the associated Product model
    await this.model('Product').findOneAndUpdate(
        { _id: productId },
        {
            averageRating: Math.ceil(result[0]?.averageRating || 0),
            numOfReviews: result[0]?.numOfReviews || 0,
        }
    );
  } catch (error) {
    console.log(error)
  }
};

// Post-save middleware to recalculate the average rating and number of reviews after saving a review
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

// Pre-delete middleware to recalculate the average rating and number of reviews before deleting a review
ReviewSchema.pre('deleteOne', { document: true }, async function (next) {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);