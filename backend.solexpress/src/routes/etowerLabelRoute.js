const express = require('express');
const router = express.Router();
const etowerLabelController = require('../controllers/etowerLabelController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/import', verifyToken, etowerLabelController.importEtowerLabels);
router.get('/', verifyToken, etowerLabelController.getEtowerLabels);
router.get('/:id/download', verifyToken, etowerLabelController.downloadEtowerLabel);
router.post('/download-zip', verifyToken, etowerLabelController.downloadEtowerLabelsZip);
router.post('/export-excel', verifyToken, etowerLabelController.exportEtowerExcel);

module.exports = router;

