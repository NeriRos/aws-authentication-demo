import AWS from 'aws-sdk';

const tableName = process.env.USERS_TABLE;
const userPoolId = process.env.USER_POOL_ID

const updateUser = async (user) => {
    const dynamo = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: tableName,
        Key: {
            national_id: user.national_id
        },
        UpdateExpression: "set phone_number = :p, first_name = :f, last_name = :l",
        ExpressionAttributeValues: {
            ":p": user.phone_number,
            ":f": user.first_name,
            ":l": user.last_name
        },
        ReturnValues: "UPDATED_OLD"
    };

    return dynamo.update(params).promise();
}

const verifyRequest = (event) => {
    if (!event.routeKey.startsWith('PUT')) {
        return {
            statusCode: 501,
            body: JSON.stringify({
                message: `Route not implemented: ${event.routeKey}`
            })
        }
    }

    const body = JSON.parse(event.body);

    if (!body.national_id) {
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

    try {
        await updateUser(body);

        const response = {
            statusCode: 204, body: JSON.stringify({
                message: "User updated successfully"
            })
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
