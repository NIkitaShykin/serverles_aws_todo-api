import { DynamoDB } from "aws-sdk";
import { v4 } from "uuid";
import { HttpError } from "../errors/HttpError";
import { ValidationError } from "../errors/ValidateError";
import { todoItem } from "./todo.dto";
import * as yup from "yup";

const docClient = new DynamoDB.DocumentClient();
const tableName = "TodoTable";

const inputType = yup.object().shape({
  label: yup.string().required(),
});

export class TodoService {
  static async addItem(item: todoItem) {
    try {
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
      if (error instanceof HttpError || error instanceof ValidationError) {
        return {
          statusCode: error.statusCode,
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
        body: JSON.stringify(output.Items?.reverse()),
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

  static async validateBody(body: any) {
    try {
      await inputType.validate(body);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        throw new ValidationError({ error: "invalid request body" });
      }
    }
  }

  static addValuesToBody(body: any) {
    try {
      const reqBody = JSON.parse(body);
      this.validateBody(reqBody);
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          statusCode: error.statusCode,
          body: error.message,
          headers: { "Content-Type": "application/json" },
        };
      }

      if (error instanceof SyntaxError) {
        return {
          statusCode: 400,
          body: `Invalid request body: ${error.message}`,
          headers: { "Content-Type": "application/json" },
        };
      }

      throw error;
    }
    return {
      ...body,
      id: v4(),
      completed: false,
      createdAt: new Date().getTime().toString(),
    };
  }
}
