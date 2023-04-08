import {CognitoJwtVerifier} from "aws-jwt-verify";
import jwt from "jsonwebtoken";

const userPoolId = process.env.USER_POOL_ID;
const userPoolClientId = process.env.CLIENT_POOL_ID;

export async function authorizeUserHandler(event) {
    const verifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: "access",
        clientId: userPoolClientId,
    });

    try {
        const token = event.headers.Authorization;
        // const payload = jwt.decode(token, {complete: true});
        const payload = await verifier.verify(token);

        return {
            principalId: payload.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [{
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: event.methodArn
                }]
            }
        };
    } catch (error) {
        console.log("Unauthenticated", error)

        return {
            principalId: 'unauthenticated',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [{
                    Action: 'execute-api:Invoke',
                    Effect: 'Deny',
                    Resource: event.methodArn
                }]
            }
        };
    }
}