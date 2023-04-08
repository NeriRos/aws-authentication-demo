import AWS from 'aws-sdk';

const tableName = process.env.USERS_TABLE;

export const getUserHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }

    console.info('received get user event');
    const dynamo = new AWS.DynamoDB.DocumentClient();

    const id = event.pathParameters.id;

    let params = {
        TableName: tableName,
        Key: {national_id: id},
    };

    try {
        const data = await dynamo.get(params).promise();
        let item = data.Item;

        const response = {
            statusCode: 200,
            body: JSON.stringify({item, id})
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
