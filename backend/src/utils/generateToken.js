import jwt from 'jsonwebtoken';

export const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const userResponse = user.toObject();
  delete userResponse.password;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      user: userResponse,
    });
};