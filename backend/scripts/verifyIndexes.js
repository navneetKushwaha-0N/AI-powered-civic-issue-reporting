import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Issue from '../models/Issue.js';

dotenv.config();

const verifyIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get existing indexes
    const indexes = await Issue.collection.getIndexes();
    console.log('\n📋 Existing Indexes:');
    console.log(JSON.stringify(indexes, null, 2));

    // Check if 2dsphere index exists
    const hasGeoIndex = Object.keys(indexes).some(key => 
      indexes[key].some(idx => idx['2dsphere'])
    );

    if (!hasGeoIndex) {
      console.log('\n⚠️  Geospatial index missing! Creating...');
      await Issue.collection.createIndex({ location: '2dsphere' });
      console.log('✅ Geospatial index created');
    } else {
      console.log('\n✅ Geospatial index exists');
    }

    // Verify by running a test query
    const testIssues = await Issue.find({}).limit(1);
    if (testIssues.length > 0) {
      console.log('\n🧪 Testing geospatial query...');
      const nearbyTest = await Issue.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: testIssues[0].location.coordinates
            },
            $maxDistance: 100
          }
        }
      }).limit(5);
      console.log(`✅ Geospatial query successful! Found ${nearbyTest.length} issues`);
    }

    console.log('\n✅ All checks passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyIndexes();
