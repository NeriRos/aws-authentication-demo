# AWS Demo

This project show how I use AWS services.

Building an authentication app

## Stack

- Cognito (User Pool)
- DynamoDB (DataBase)
- Lambda (Serverless)
- AWS SAM (IaC)
- NodeJS (Runtime)

## Development

Running the create user endpoint

```bash
sam build && sam local invoke createUserFunction -e events/event-create-user.json
```

## The test

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
3. Implement another Lambda function to handle user login. This function should verify the user's
   credentials against
   the user pool and return a JSON web token (JWT) if the credentials are valid.
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