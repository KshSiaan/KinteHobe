import {ServerClient} from "postmark";

const postmarkClient = new ServerClient(process.env.MAILER_API_KEY!);

export async function SendVerificationEmail({user,url}:{user:{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
},url:string}){

    await postmarkClient.sendEmail({
        From: "raven@testmail.com",
        To: user.email,
        Subject: "Verify your email",
        TextBody: `Please click the following link to verify your email: ${url}`
    });

}