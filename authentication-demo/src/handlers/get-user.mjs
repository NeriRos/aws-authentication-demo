import AWS from 'aws-sdk';

const tableName = process.env.USERS_TABLE;

const verifyRequest = async (event) => {
    if (!event.routeKey.startsWith('GET')) {
        return {
            statusCode: 501,
            body: JSON.stringify({
                message: `Route not implemented: ${event.routeKey}`
            })
        }
    }
}

export const getUserHandler = async (event) => {
    const isRequestInvalid = await verifyRequest(event);
    if (isRequestInvalid) {
        return isRequestInvalid;
    }

    console.info('received get user event');

    const dynamo = new AWS.DynamoDB.DocumentClient();

    const id = event.pathParameters.id;

    let params = {
        TableName: tableName, Key: {national_id: id},
    };

    try {
        const data = await dynamo.get(params).promise();
        let item = data.Item;

        const response = {
            statusCode: 200, body: JSON.stringify({user: item, id})
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
