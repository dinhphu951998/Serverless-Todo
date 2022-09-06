# Serverless TODO


# Functionality of the application

This application will allow creating/removing/updating/fetching TODO items. Each TODO item can optionally have an attachment image. Each user only has access to TODO items that he/she has created.

When todo is over due date, there is an email to notify him/her.

## TODO items

The application stores TODO items, and each TODO item contains the following fields:

* `todoId` (string) - a unique id for an item
* `name` (string) - name of a TODO item (e.g. "Change a light bulb")
* `dueDate` (string) - date and time by which an item should be completed
* `done` (boolean) - true if an item was completed, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a TODO item

## Tech stack

* <a href="https://manage.auth0.com/" target="_blank">Auth0</a>
* <a href="https://reactjs.org/" target="_blank">ReactJS</a>
* <a href="https://nodejs.org/en/download/package-manager/" target="_blank">NodeJS</a>
* <a href="https://www.serverless.com/" target="_blank">Serverless</a>
* <a href="https://aws.amazon.com/" target="_blank">Amazon Web Service</a>
   
## Architecture
![Overall Architecture](architecture/overall-architecture.png?raw=true)

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application, first, edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.