import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, PutCommand} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.USERS_TABLE;

export const createUserHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    console.info('received:', event);

    const body = JSON.parse(event.body);

    const requiredFields = ['first_name', 'last_name', 'phone_number', 'national_id'];
    const missingFields = requiredFields.filter(field => !(field in body));

    if (missingFields.length) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `Missing fields: ${missingFields.join(', ')}`
            })
        }
    }

    const params = {
        TableName: tableName,
        Item: {
            first_name: body.first_name,
            last_name: body.last_name,
            phone_number: body.phone_number,
            national_id: body.national_id
        }
    };

    try {
        const data = await ddbDocClient.send(new PutCommand(params));
        console.log("Success - item added or updated", data);

        const response = {
            statusCode: 201,
            body: JSON.stringify({
                message: `User added successfully`,
                id: data.id,
                data
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