import { Router } from 'express';
import { ExecutionController } from '../controllers/execution.controller';

const router = Router();
const executionController = new ExecutionController();

router.post('/', executionController.executeScript);
router.get('/', executionController.listExecutions);
router.get('/:id', executionController.getExecution);
router.get('/:id/logs', executionController.getExecutionLogs);
router.post('/:id/stop', executionController.stopExecution);

export default router;
