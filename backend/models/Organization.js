import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot be more than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Organization code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]{6,12}$/, 'Organization code must be 6-12 alphanumeric characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  memberCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster lookups (code already has unique index from schema)
organizationSchema.index({ adminId: 1 });
organizationSchema.index({ isActive: 1 });

// Static method to generate unique organization code
organizationSchema.statics.generateCode = function(orgName) {
  // Take first 3 letters of org name (uppercase) + 6 random chars
  const prefix = orgName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomPart}`.substring(0, 10);
};

// Method to check if code is valid and active
organizationSchema.statics.validateCode = async function(code) {
  const org = await this.findOne({ code: code.toUpperCase(), isActive: true });
  return org;
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
