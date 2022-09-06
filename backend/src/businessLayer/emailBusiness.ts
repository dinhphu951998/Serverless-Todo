import { TodoItem } from "./../models/TodoItem";
import * as AWS from "aws-sdk";
import { SendEmailRequest } from "aws-sdk/clients/ses";
import { createLogger } from "../utils/logger";

const sender = process.env.TODO_EMAIL;
const sesConfig = {
  region: process.env.REGION,
  apiVersion: "2010-12-01",
};
const logger = createLogger("EmailBusiness");

export class EmailBusiness {
  constructor(private readonly sesAws = new AWS.SES(sesConfig)) {}

  async sendEmail(dest: string, todos: TodoItem[]) {
    const params: SendEmailRequest = {
      Destination: {
        ToAddresses: [dest],
      },
      Source: sender,
      Message: {
        Subject: {
          Data: "You have due todo item(s)!",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: this.createEmailBody(todos),
            Charset: "UTF-8",
          },
        },
      },
    };
    try {
      const response = await this.sesAws.sendEmail(params).promise();
      logger.info("Send email sucessfully: " + JSON.stringify(response));
    } catch (error) {
      logger.info("Error while sending email: " + JSON.stringify(error));
    }
  }

  private createEmailBody(todos: TodoItem[]) {
    let body = "Your due todo item:\n";
    for (const i in todos) {
      body += (Number(i) + 1) + ".\n";
      body += "Name: " + todos[i].name + "\n";
      body += "DueDate: " + todos[i].dueDate + "\n";
    }
    body += "\nPlease take your time to complete\n\n";
    body += "Thank you!";

    return body;
  }
}
