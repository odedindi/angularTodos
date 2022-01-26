import { v4 as uuid } from 'uuid';

export default class Todo {
  id: string;
  createdAt: Date;
  updatedAt: Date | undefined;
  description: string;
  completed: boolean;

  constructor(description: string) {
    this.id = uuid();
    this.description = description;
    this.completed = false;
    this.createdAt = new Date(Date.now());
    this.updatedAt = undefined;
  }
}
