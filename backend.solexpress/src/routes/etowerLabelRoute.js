const express = require('express');
const router = express.Router();
const etowerLabelController = require('../controllers/etowerLabelController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/import', verifyToken, etowerLabelController.importEtowerLabels);
router.post('/search', verifyToken, etowerLabelController.getEtowerLabels);
router.get('/:id/download', verifyToken, etowerLabelController.downloadEtowerLabel);
router.post('/download-zip', verifyToken, etowerLabelController.downloadEtowerLabelsZip);
router.post('/export-excel', verifyToken, etowerLabelController.exportEtowerExcel);
router.post('/delete-orders', verifyToken, etowerLabelController.deleteEtowerOrders);

module.exports = router;

