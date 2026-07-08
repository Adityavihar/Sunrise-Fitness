const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  updateMember,
  suspendMember,
  extendMembership,
  deleteMember,
  exportMembersCsv
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// CSV export must be placed BEFORE dynamic :id routes to prevent clash
router.get('/export/csv', protect, authorize('admin'), exportMembersCsv);

// Admin-only actions
router.get('/', protect, authorize('admin'), getAllMembers);
router.get('/:id', protect, authorize('admin'), getMemberById);
router.put('/:id/suspend', protect, authorize('admin'), suspendMember);
router.put('/:id/extend', protect, authorize('admin'), extendMembership);
router.delete('/:id', protect, authorize('admin'), deleteMember);

// Member updating own details / Admin updating member details
router.put('/:id', protect, upload.single('profilePicture'), updateMember);

module.exports = router;
