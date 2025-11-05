import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';
import { validateWorkflow } from '../middlewares/validation';

const router = Router();
const workflowController = new WorkflowController();

router.post('/', validateWorkflow, workflowController.createWorkflow);
router.get('/', workflowController.listWorkflows);
router.get('/:id', workflowController.getWorkflow);
router.put('/:id', validateWorkflow, workflowController.updateWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);
router.post('/:id/generate-script', workflowController.generateScript);

export default router;
