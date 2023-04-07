import AWS from 'aws-sdk';

const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

export const getUserHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received get user event');

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
            body: JSON.stringify(item)
        };

        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
        return response;

    } catch (err) {
        console.log("Error", err.toString());

        const response = {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error getting user: ${err.stack.toString()}`
            })
        };
    }
}
