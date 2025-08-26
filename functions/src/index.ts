import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import * as cors from "cors";

admin.initializeApp();

const corsHandler = cors({origin: true});

// Placeholder for email sending function
export const sendMail = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    res.status(200).send("Function is ready, but email sending is not implemented yet.");
  });
});
