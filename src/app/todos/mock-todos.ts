import Todo from './models/todo.model';

export const TODOS = (n: number) =>
  Array.from({ length: n }, (_, i) => new Todo(`todo #${i + 1}`));
