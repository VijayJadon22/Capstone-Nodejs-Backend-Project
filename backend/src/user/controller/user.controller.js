import { ErrorHandler } from "../../../utils/emails/errorHandler.js";
import { sendWelcomeEmail } from "../../../utils/emails/nodeMailer.js";
import { createNewUserRepo } from "../models/user.repository.js";

export const createNewUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const newUser = await createNewUserRepo(req.body);

        // Implement sendWelcomeEmail function to send welcome message
        await sendWelcomeEmail(newUser);

    } catch (error) {
        return next(new ErrorHandler(400, error));
    }
};

export const userLogin =async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler(400, "please enter email/password"));
        }
        const user = await findUserRepo({ email }, true);
        
    } catch (error) {
        
    }
}


