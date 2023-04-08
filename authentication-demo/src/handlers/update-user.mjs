import AWS from 'aws-sdk';
import {CognitoJwtVerifier} from "aws-jwt-verify";

const tableName = process.env.USERS_TABLE;
const userPoolId = process.env.USER_POOL_ID

const updateUser = async (user) => {
    const dynamo = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: tableName, Key: {
            national_id: user.national_id, ...(user.phone_number && {phone_number: user.phone_number}), ...(user.first_name && {first_name: user.first_name}), ...(user.last_name && {last_name: user.last_name}),
        }
    };

    return dynamo.update(params).promise();
}

const updateCognito = async (user) => {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const params = {
        UserPoolId: userPoolId,
        Username: user.national_id, ...(user.password && {Password: user.password}),
        UserAttributes: [{
            Name: 'phone_number', Value: user.phone_number
        },]
    };

    return cognito.adminUpdateUserAttributes(params).promise();
}

const verifyRequest = async (event) => {
    if (event.httpMethod !== 'PUT') {
        return {
            statusCode: 400, body: JSON.stringify({
                message: `Bad request`
            })
        }
    }

    return null
}


export const updateUserHandler = async (event) => {
    const isRequestInvalid = verifyRequest(event);
    if (isRequestInvalid) {
        return isRequestInvalid;
    }

    console.info('received update user event');

    const body = JSON.parse(event.body);

    if (!body.national_id) {
        return {
            statusCode: 400, body: JSON.stringify({
                message: `Bad request`
            })
        }
    }

    try {
        const updatedUser = await updateUser(body)
        const updatedCognitoUser = await updateCognito(body);

        const response = {
            statusCode: 204, body: JSON.stringify(updatedUser)
        };

        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
        return response;

    } catch (err) {
        console.log("Error", err.toString());

        return {
            statusCode: 500, body: JSON.stringify({
                message: `Error getting user: ${err.stack.toString()}`
            })
        };
    }
}
