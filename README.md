# AWS Demo

This project show how I use AWS services.

Building an authentication app

## Stack

- Cognito (User Pool)
- DynamoDB (DataBase)
- Lambda (Serverless)
- AWS SAM (IaC)
- NodeJS (Runtime)

## How to run

### Prerequisites

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

### Redeploy

No need to redeploy the stack. \
But if you do, you can use the following commands:

```bash
sam build
sam deploy
```

And replace the tests with the new API Gateway URLs.

There are two gateways: 

1. Unauthenticated requests
    - output key: `WebEndpoint`
    - functions: Create user, Login user
2. Authenticated requests
    - output key: `WebAuthEndpoint`
    - functions: Get user, Update user

### Test results

<details>
  <summary>1. Create user</summary>

POST https://mc1qjoxaod.execute-api.eu-central-1.amazonaws.com/Prod/user

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+972123456789",
  "national_id": "1234567891",
  "password": "12345678"
}
```

**Navigate to the AWS Cognito to confirm the user.**

</details>

<details>
  <summary>2. Login</summary>

POST https://mc1qjoxaod.execute-api.eu-central-1.amazonaws.com/Prod/user/login

```json
{
  "national_id": "1234567891",
  "password": "12345678"
}
```

Copy the access token from the response body or cookie. \
And use it in the next request in the Authorization header.

</details>

<details>
  <summary>3. Get user</summary>

GET https://l59g4gnum0.execute-api.eu-central-1.amazonaws.com/Prod/user/1234567891

</details>

<details>
  <summary>4. Update user</summary>

PUT https://l59g4gnum0.execute-api.eu-central-1.amazonaws.com/Prod/user

```json
{
  "first_name": "Jane!!!!!",
  "last_name": "Doe",
  "phone_number": "+972123123123",
  "national_id": "1234567891"
}
```

</details>

<details>
  <summary>5. Confirm changes</summary>

GET https://l59g4gnum0.execute-api.eu-central-1.amazonaws.com/Prod/user/1234567891

see the name changed to Jane!!!!! and the phone number changed to +972123123123

</details>

## The assignment

This test is designed to evaluate your proficiency in API gateway and AWS Lambda. Feel free to use
any npm packages as
needed.

Follow the steps below:

1. Set up a Cognito user pool for managing user registration and authentication.
2. Develop a Lambda function for user registration, which should add the newly registered user to a
   DynamoDB table.
   Ensure all fields are saved in both DynamoDB and Cognito. Allowed fields:
    - Fields
        - First name: up to 20 letters
        - Last name: up to 20 letters
        - ID: a valid Israeli ID
        - Phone number: a valid phone number
        - Password: minimum 6 characters
    - Note that all fields are mandatory.
    - If incorrect data is provided, return a 400 HTTP response.
    - If successful, return a 201 HTTP response along with the ID from DynamoDB.
    - Endpoint: POST /user
3. Implement another Lambda function to handle user. This function should verify the
   user's credentials against the user pool and return a JSON web token (JWT) if the credentials are
   valid.
    - Endpoint: POST /user/login
4. Create a Lambda function for processing authorized requests. This function should verify a valid
   JWT in the request
   headers before permitting the request to proceed and update user data.
    - Endpoint: PUT /user
5. Develop a Lambda function for handling authorized requests. This function should check for a
   valid JWT in the request
   headers before allowing the request to proceed and read user data.
    - Endpoint: GET user/{id}
6. Implement a Lambda function to retrieve a user by their ID.
7. Provide a Postman collection along with your code.

## References and resources

- [Authorize APIs with Cognito UserPool](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html)
- [Verifying JWT](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html)