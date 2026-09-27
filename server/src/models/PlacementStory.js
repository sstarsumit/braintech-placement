import mongoose from 'mongoose';

const placementStorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, default: '' },
    company: { type: String, default: '' },
    photo: { type: String, default: '' },
    story: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('PlacementStory', placementStorySchema);
