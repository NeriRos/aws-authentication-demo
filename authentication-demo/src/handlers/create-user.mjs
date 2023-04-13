import AWS from 'aws-sdk';

const tableName = process.env.USERS_TABLE;
const userPoolClientId = process.env.CLIENT_POOL_ID

const registerCognitoUser = async (user) => {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const params = {
        ClientId: userPoolClientId,
        Password: user.password,
        Username: user.national_id,
        UserAttributes: [
            {
                Name: 'phone_number',
                Value: user.phone_number
            },
        ]
    };

    return cognito.signUp(params).promise();
}

const createUserInDynamoDB = async (user) => {
    const dynamo = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: tableName,
        Item: {
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            national_id: user.national_id
        }
    };

    const data = await dynamo.put(params).promise();

    console.log("Success - item added or updated", data);

    return user.national_id
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
    const body = JSON.parse(event.body);

    const requiredFields = ['first_name', 'last_name', 'phone_number', 'national_id', "password"];
    const missingFields = requiredFields.filter(field => !(field in body));

    if (missingFields.length) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `Missing fields: ${missingFields.join(', ')}`
            })
        }
    }

    if (body.first_name.length > 20 || body.last_name.length > 20) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `First name and last name must be less than 20 characters`
            })
        }
    }

    return null;
}

export const createUserHandler = async (event) => {
    const isRequestInvalid = verifyRequest(event);
    if (isRequestInvalid) {
        return isRequestInvalid;
    }

    console.info('received create user event');

    const body = JSON.parse(event.body);

    try {
        const id = await createUserInDynamoDB(body);
        const cognitoResponse = await registerCognitoUser(body)

        const response = {
            statusCode: 201,
            body: JSON.stringify({
                message: `User added successfully!`,
                congitoId: cognitoResponse.UserSub,
                id,
            })
        };

        console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
        return response;


    } catch (err) {
        console.error("Error", err.stack);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error adding user: ${err.stack}`
            })
        }
    }
}


