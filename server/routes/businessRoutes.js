const express = require('express');
const {
    getMyProjects,
    getProject,
    saveProject,
    setActiveProject,
    clearActiveProject,
    saveScenarios,
    duplicateProject,
    deleteProject,
    getLeaderboard,
    generateShare,
    getComments,
    addComment,
    deleteComment,
    emailReport
} = require('../controllers/businessController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMyProjects)
    .post(saveProject);

// Static routes BEFORE the dynamic /:id route so they aren't shadowed
router.get('/leaderboard', getLeaderboard);
router.patch('/active/clear', clearActiveProject);

router.route('/:id')
    .get(getProject)
    .delete(deleteProject);

router.patch('/:id/active', setActiveProject);
router.patch('/:id/scenarios', saveScenarios);
router.post('/:id/duplicate', duplicateProject);
router.post('/:id/share', generateShare);
router.post('/:id/email-report', emailReport);
router.route('/:id/comments')
    .get(getComments)
    .post(addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
