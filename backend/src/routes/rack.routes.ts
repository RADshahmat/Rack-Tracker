import { Router } from 'express';
import rackController from '../modules/racks/rack.controller';
import { uploadMiddleware } from '../middleware/uploadMiddleware';

const router = Router();

router.get('/', rackController.getAll.bind(rackController));
router.get('/:id', rackController.getById.bind(rackController));
router.get('/:id/slots', rackController.getSlots.bind(rackController));
router.get('/:id/attachments', rackController.getAttachments.bind(rackController));
router.post('/', rackController.create.bind(rackController));
router.post(
    '/:id/upload',
    uploadMiddleware.single('file'),        // field name must be 'file'
    rackController.upload.bind(rackController)
);
router.put('/:id', rackController.update.bind(rackController));
router.delete('/:id', rackController.delete.bind(rackController));
router.delete(
    '/:id/attachments/:attachmentId',
    rackController.deleteAttachment.bind(rackController)
);
router.get(
    '/:id/attachments/:attachmentId/download',
    rackController.downloadAttachment.bind(rackController)
);

export default router;