import { Request, Response } from 'express';
import Notifications from "../db_schema/notifications";
import { AuthRequest } from 'src/middlewares/authMiddleware';

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?._id) {
            return res.json(await Notifications.find({ user_id: req.user?._id }));
        } else {
            return res.status(404).json("missing user id")
          }
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

export const getNotificationsNumber = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?._id) {
            return res.json(await Notifications.countDocuments({ user_id: req.user?._id }));
        } else {
            return res.status(404).json("missing user id")
          }
    } catch (error) {
        res.status(500).send(error);
    }
};
