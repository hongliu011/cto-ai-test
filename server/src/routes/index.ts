import { Router } from 'express';
import workflowRoutes from './workflow.routes';
import scriptRoutes from './script.routes';
import executionRoutes from './execution.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/workflows', workflowRoutes);
router.use('/scripts', scriptRoutes);
router.use('/executions', executionRoutes);
router.use('/uploads', uploadRoutes);

export default router;
