import User from '../models/User.js';

export const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    // Promote only if currently a normal user
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, role: 'user' },
      { $set: { role: 'admin' } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found or already an admin'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User promoted to admin successfully',
      data: { id: updatedUser._id, role: updatedUser.role }
    });
  } catch (error) {
    console.error('Make admin error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
