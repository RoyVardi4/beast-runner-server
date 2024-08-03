import { Request, Response } from 'express';
import Notifications from "../db_schema/notifications";

export const getNotifications = async (_: Request, res: Response) => {
    try {
        return res.json(await Notifications.find({ user_id: 'Roy' })); //todo insert here the real id
    } catch (error) {
        res.status(500).send(error);
    }
};
  
export const deleteNotification = async (req: Request, res: Response) => {
    try {
      return res.json(await Notifications.deleteOne({_id: req.query.id}));
    } catch (error) {
      res.status(500).send(error);
    }
};

export const getNotificationsNumber = async (_: Request, res: Response) => {
    try {
        return res.json(await Notifications.countDocuments({ user_id: 'Roy' })); //todo insert here the real id
    } catch (error) {
        res.status(500).send(error);
    }
};
  