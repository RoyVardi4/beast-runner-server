import { Request, Response } from 'express';
import logger from '../utils/logger';

export const healthCheck = async (_req: Request, res: Response) => {
    logger.info('Server is starting');
    res.send('Server is working');
  }