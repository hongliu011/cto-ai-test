import { Router } from 'express';
import { ScriptController } from '../controllers/script.controller';

const router = Router();
const scriptController = new ScriptController();

router.get('/', scriptController.listScripts);
router.get('/:id', scriptController.getScript);
router.get('/:id/download', scriptController.downloadScript);
router.post('/:id/validate', scriptController.validateScript);
router.delete('/:id', scriptController.deleteScript);

export default router;
