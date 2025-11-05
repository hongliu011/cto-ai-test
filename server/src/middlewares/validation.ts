import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

const workflowStepSchema = Joi.object({
  id: Joi.string().optional(),
  order: Joi.number().required(),
  action: Joi.string().required(),
  target: Joi.string().required(),
  value: Joi.string().optional(),
  screenshotUrl: Joi.string().optional(),
  description: Joi.string().optional()
});

const workflowSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().optional().max(500),
  steps: Joi.array().items(workflowStepSchema).required(),
  videoUrl: Joi.string().optional()
});

export const validateWorkflow = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = workflowSchema.validate(req.body);
  
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  
  next();
};
