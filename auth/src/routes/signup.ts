import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .isLength({min: 4, max:20})
            .withMessage('Password must be between 4 and 20 characters')]
    , 
    validateRequest,
    async (req : Request,res: Response)=>{
        const {email, password} = req.body;

        const existingUser = await User.findOne({email});
        
        if(existingUser){
            throw new BadRequestError("Email in use");
        }

        const user = User.build({email, password});
        await user.save();

        //Generate JWT
        const userJwt = jwt.sign({id: user.id, email: user.email}, process.env.JWT_KEY!); // we put an ! mark to avoid ts warning/error about process.env.JWT_KEY may not be defined

        //Save it to session
        req.session ={
            jwt: userJwt
        } ;

        res.status(201).send(user);
});

export {router as signupRouter};