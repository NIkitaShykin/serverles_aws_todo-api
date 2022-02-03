import { DynamoDB } from "aws-sdk";
import { v4 } from "uuid";
import { HttpError } from "../errors/HttpError";
import { ValidationError } from "../errors/ValidateError";
import { todoItem } from "./todo.dto";

const docClient = new DynamoDB.DocumentClient();
const tableName = "TodoTable";

export class TodoService {
  static async addItem(body: any) {
    try {
      const item: todoItem = this.addValuesToBody(body);
      const newItem = await docClient
        .put({
          TableName: tableName,
          Item: item,
        })
        .promise();

      if (newItem.$response.error) {
        throw new HttpError(400, { error: "Unable to add item" });
      }

      return {
        statusCode: 201,
        body: JSON.stringify(item),
        headers: { "Content-Type": "application/json" },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          statusCode: error.statusCode,
          body: error.message,
          headers: { "Content-Type": "application/json" },
        };
      }
      if (error instanceof HttpError) {
        return {
          statusCode: error.statusCode,
          body: error.message,
          headers: { "Content-Type": "application/json" },
        };
      }
      if (error instanceof SyntaxError) {
        return {
          statusCode: 404,
          body: error.message,
          headers: { "Content-Type": "application/json" },
        };
      }

      throw error;
    }
  }

  static async getItems() {
    try {
      const output = await docClient.scan({ TableName: tableName }).promise();
      if (output.$response.error) {
        throw new HttpError(404, { error: "No items found" });
      }
      return {
        statusCode: 200,
        body: JSON.stringify(output.Items /* ?.reverse() */),
        headers: { "Content-Type": "application/json" },
      };
    } catch (error) {
      if (error instanceof HttpError) {
        return {
          statusCode: error.statusCode,
          body: error.message,
          headers: { "Content-Type": "application/json" },
        };
      }

      throw error;
    }
  }

  static validateBody(body: any) {
    for (const param in body as object) {
      if (param !== "label") {
        throw new ValidationError({ error: "invalid body" });
      }
    }
  }

  static addValuesToBody(body: any): todoItem {
    try {
      const reqBody = JSON.parse(body);
      this.validateBody(reqBody);
      return {
        ...reqBody,
        id: v4(),
        completed: false,
        createdAt: new Date().getTime().toString(),
      };
    } catch (e) {
      throw e;
    }
  }
}
