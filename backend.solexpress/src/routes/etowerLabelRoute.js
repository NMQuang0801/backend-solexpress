const express = require('express');
const router = express.Router();
const etowerLabelController = require('../controllers/etowerLabelController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.post('/import', verifyToken, etowerLabelController.importEtowerLabels);
router.post('/search', verifyToken, etowerLabelController.getEtowerLabels);
router.get('/print-errors', verifyToken, isAdmin, etowerLabelController.getPrintErrors);
router.post('/retry-errors', verifyToken, isAdmin, etowerLabelController.retryAdminPrintErrors);
router.post('/retry-print', verifyToken, etowerLabelController.retryPrintByRef);
router.post('/download-zip', verifyToken, etowerLabelController.downloadEtowerLabelsZip);
router.post('/export-excel', verifyToken, etowerLabelController.exportEtowerExcel);
router.post('/delete-orders', verifyToken, etowerLabelController.deleteEtowerOrders);
router.get('/:id/download', verifyToken, etowerLabelController.downloadEtowerLabel);

module.exports = router;

