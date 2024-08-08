import { Request, Response } from 'express';
import User,{UserData} from "../models/userModel";
import {OAuth2Client} from "google-auth-library";
import jwt, {VerifyErrors} from 'jsonwebtoken';
import {Document} from "mongoose";
import * as process from "process";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);
const googleSignin = async (req: Request, res: Response) => {
    console.log("googleSignin");
    console.log("clientid: ",process.env.GOOGLE_CLIENT_ID!)
    console.log(req.body.idToken);
    try {
        const {idToken} = req.body;
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID!,
        });
        const payload = ticket.getPayload();
        const email = payload?.email;
        //register
        if (email != null) {
            let user = await User.findOne({ 'email': email }) as  Document<unknown, {}, UserData> & UserData & Required<{_id: string}>;
            if (user == null) {
                user = await User.create(
                    {
                        'email': email,
                    });
            }
            const tokens = await generateTokens(user)
            res.status(200).send(
                {
                    email: user.email,
                    _id: user._id,
                    ...tokens
                })
        }
    } catch (err) {
        console.log("error in googleSignin");
        console.log(err);
        return res.status(400).send(err.message);
    }

}

const generateTokens = async (user: Document & UserData) => {
    const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRATION! });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET!);
    if (user.refreshTokens == null) {
        user.refreshTokens = [refreshToken];
    } else {
        user.refreshTokens.push(refreshToken);
    }
    await user.save();
    return {
        'accessToken': accessToken,
        'refreshToken': refreshToken
    };
}

const logout = async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (refreshToken == null)
        return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, async (err: VerifyErrors | null, decoded: any) => {
        if (err) {
            console.log(err);
            return res.sendStatus(401);
        }
        try {
            const userId = decoded._id;
            const userDb = await User.findOne({ '_id': userId }) as Document<unknown, {}, UserData> & UserData & Required<{_id: string}>;
            if (!userDb.refreshTokens || !userDb.refreshTokens.includes(refreshToken)) {
                userDb.refreshTokens = [];
                await userDb.save();
                return res.sendStatus(401);
            } else {
                userDb.refreshTokens = userDb.refreshTokens.filter(t => t !== refreshToken);
                await userDb.save();
                console.log("logout successfully!")
                return res.sendStatus(200);
            }
        } catch (err) {
            res.status(401).send(err.message);
        }
    });
}

const refresh = async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, async (err: VerifyErrors | null, decoded: any) => {
        if (err) {
            console.log(err);
            return res.sendStatus(401);
        }
        try {
            const userId = decoded._id;
            const userDb = await User.findOne({ '_id': userId }) as Document<unknown, {}, UserData> & UserData & Required<{_id: string}>;
            if (!userDb.refreshTokens || !userDb.refreshTokens.includes(refreshToken)) {
                userDb.refreshTokens = [];
                await userDb.save();
                return res.sendStatus(401);
            }
            const accessToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRATION! });
            const newRefreshToken = jwt.sign({ _id: userId }, process.env.JWT_REFRESH_SECRET!);
            userDb.refreshTokens = userDb.refreshTokens.filter(t => t !== refreshToken);
            userDb.refreshTokens.push(newRefreshToken);
            await userDb.save();
            return res.status(200).send({
                'accessToken': accessToken,
                'refreshToken': newRefreshToken
            });
        } catch (err) {
            res.status(401).send(err.message);
        }
    });
}

export default {
    googleSignin,
    logout,
    refresh
}
