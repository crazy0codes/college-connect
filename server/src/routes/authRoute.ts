import express, { Request, Response, NextFunction } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// User Registration is not implemented yet
// router.post('/register', async (req: Request, res: Response) => {
//   try {
//     await authController.registerUser(req, res);
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

router.post('/login', async (req: Request, res: Response) => {
  try {
    await authController.loginUser(req, res);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/forgot-password', async (req: Request, res: Response) => {
  try {
    await authController.forgotPassword(req, res);
  }
  catch (error) {
    console.error('Error during forgot password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    await authController.verifyEmail(req, res);
  }
  catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/reset-password/:token', async (req: Request, res: Response) => {
  try {
    await authController.resetPassword(req, res);
  }
  catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     await authController.logoutUser(req, res);
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     await authController.getUserProfile(req, res);
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

export default router;
