import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";
import { TodoService } from "./todo/todo.service";

export const createTodo = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return TodoService.addItem(event.body);
};

export const getTodos = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return TodoService.getItems();
};
