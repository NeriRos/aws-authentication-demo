import AWS from 'aws-sdk';

const tableName = process.env.USERS_TABLE;
const userPoolId = process.env.USER_POOL_ID

// TODO: Change to layer
const authorizeUserWithJWT = async (jwt, user) => {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const params = {
        UserPoolId: userPoolId,
        Token: jwt,
        Username: user.national_id
    }

    return cognito.adminGetUser(params).promise();
}

const updateUser = async (user) => {
    const dynamo = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: tableName,
        Key: {
            national_id: user.national_id,
            ...(user.phone_number && {phone_number: user.phone_number}),
            ...(user.first_name && {first_name: user.first_name}),
            ...(user.last_name && {last_name: user.last_name}),
        }
    };

    const res = await dynamo.update(params).promise();
    console.log("RESPONMSEDE UPDATETE", JSON.stringify(res.$response.data))

    return res;
}

const updateCognito = async (user) => {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const params = {
        UserPoolId: userPoolId,
        Username: user.national_id,
        ...(user.password && {Password: user.password}),
        UserAttributes: [
            {
                Name: 'phone_number',
                Value: user.phone_number
            },
        ]
    };

    return cognito.adminUpdateUserAttributes(params).promise();
}

export const updateUserHandler = async (event) => {
    if (event.httpMethod !== 'PUT') {
        throw new Error(`getMethod only accept PUT method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received update user event');

    const body = JSON.parse(event.body);

    if (!body.national_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `Bad request`
            })
        }
    }

    try {
        const data = await updateUser(body)

        const response = {
            statusCode: 204,
            body: JSON.stringify(data.$response)
        };

        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
        return response;

    } catch (err) {
        console.log("Error", err.toString());

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error getting user: ${err.stack.toString()}`
            })
        };
    }
}
