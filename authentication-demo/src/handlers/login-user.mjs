import AWS from 'aws-sdk';

const userPoolClientId = process.env.CLIENT_POOL_ID

const loginUser = async (user) => {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const params = {
        ClientId: userPoolClientId, AuthFlow: 'USER_PASSWORD_AUTH', AuthParameters: {
            USERNAME: user.national_id, PASSWORD: user.password
        }
    }

    return cognito.initiateAuth(params).promise();
}

const verifyRequest = (event) => {
    if (!event.routeKey.startsWith('POST')) {
        return {
            statusCode: 501,
            body: JSON.stringify({
                message: `Route not implemented: ${event.routeKey}`
            })
        }
    }
}

export const loginUserHandler = async (event) => {
    const isRequestInvalid = verifyRequest(event);
    if (isRequestInvalid) {
        return isRequestInvalid;
    }

    console.info('received login user event');

    const body = JSON.parse(event.body);

    if (!(body.national_id && body.password)) {
        return {
            statusCode: 400, body: JSON.stringify({
                message: `Bad request`
            })
        }
    }

    try {
        const data = await loginUser(body)

        const response = {
            statusCode: 200, body: JSON.stringify({
                data
            }), headers: {
                'Set-Cookie': `jwt_token=${data.AuthenticationResult.AccessToken}; HttpOnly; Secure; SameSite=None`
            }
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
