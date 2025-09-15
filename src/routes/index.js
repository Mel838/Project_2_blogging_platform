import express from "express";

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    success: true,
    message: 'Welcome to Blogging Platform API',
    data: {
      platform: 'Blogging Platform',
      version: '1.0.0',
      status: 'active'
    }
  });
});

export default router;