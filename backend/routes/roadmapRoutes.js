const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
router.get('/all', roadmapController.getAllRoadmaps);
// المسار ده هيكون: /api/roadmaps/:id
router.get('/:id', roadmapController.getRoadmapData);

module.exports = router;

