import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, map, scan, share, tap } from 'rxjs/operators';

import Todo from '../todos/models/todo.model';
import { TODOS } from '../todos/mock-todos';

import { MessageService } from './message.service';

const storage = {
  storageName: 'myAngularTodos',
  get: function (): Todo[] {
    const data = localStorage.getItem(this.storageName);
    if (data) {
      // console.log('localStorage get data parsed: ', JSON.parse(data!));
      return JSON.parse(data);
    }
    return TODOS(10);
    // return data ? JSON.parse(data) : TODOS;
  },
  set: function (item: string | any): void {
    // console.log('update localStorage with: ', item);
    typeof item === 'string'
      ? localStorage.setItem(this.storageName, item)
      : localStorage.setItem(this.storageName, JSON.stringify(item));
  },
};

type TodosOperation = (todos: Todo[]) => Todo[];
const initialTodos: Todo[] = storage.get();
/**
 * const initialTodos$ = fromFetch('url').pipe(
 *    switchMap(res => {
 *      if (res.ok) return res.json();
 * // Server is returning a status requiring the client to
 * //   try something else.
 *      return of({ error: true, message:`Error ${res.status}` })
 *    }),
 *    catchError(err => {
 * // Network or other error, handle appropriately
 *      console.error(err);
 *      return of({ error: true, message: err.message })
 *    })
 * )
 *     ...
 *     ...
 *     ...
 * initialTodos$.subscribe({
 *  next: result => console.logger(result),
 *  complete: () => console.logger('done')
 * });
 *
 */
@Injectable({
  providedIn: 'root',
})
export class TodoService {
  todos$: Observable<Todo[]>;
  update$ = new BehaviorSubject<TodosOperation>((todos: Todo[]) => todos);

  private create$ = new Subject<Todo>();
  private edit$ = new Subject<Todo>();
  private removeCompleted$ = new Subject<null>();
  private remove$ = new Subject<Todo['id']>();
  private toggle$ = new Subject<Todo['id']>();
  private toggleAll$ = new Subject<boolean>();

  private createNewTodo$ = new Subject<Todo>();
  private editTodo$ = new Subject<Todo>();
  private removeTodo$ = new Subject<Todo['id']>();
  private removeCompletedTodo$ = new Subject<null>();
  private toggleTodo$ = new Subject<Todo['id']>();
  private toggleAllTodos$ = new Subject<boolean>();

  private logger = (message: string) =>
    this.messageService.add(`TodoService: ${message}`);
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   *  TODO: send the error to remote logging infrastructure
   *  TODO: better job of transforming error for user consumption
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      this.logger(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  private todosUrl = 'api/todos';

  private initalTodos$ = this.http.get<Todo[]>(this.todosUrl).pipe(
    tap((_) => this.logger('fetched todos')),
    catchError(this.handleError<Todo[]>('getTodos', []))
  );
  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.todos$ = this.update$.pipe(
      scan<TodosOperation, Todo[]>(
        (todos, operation) => operation(todos),
        initialTodos
      ),
      tap((todos) =>
        this.logger(
          `tap: ${JSON.stringify(todos.map(({ description }) => description))}`
        )
      ),
      share<Todo[]>({
        connector: () => new ReplaySubject(1),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      })
    );
    this.todos$.forEach((todos: Todo[]): void => storage.set(todos));
    this.create$
      .pipe(map<Todo, TodosOperation>((todo) => (todos) => [todo, ...todos]))
      .subscribe(this.update$);

    this.edit$
      .pipe(
        map<Todo, TodosOperation>((modifiedTodo) => (todos) => [
          ...todos.map((todo) =>
            todo.id === modifiedTodo.id
              ? {
                  ...todo,
                  description: todo.description,
                  updatedAt: new Date(Date.now()),
                }
              : todo
          ),
        ])
      )
      .subscribe(this.update$);

    this.removeCompleted$
      .pipe(
        map<null, TodosOperation>(
          () => (todos) => todos.filter(({ completed }) => !completed)
        )
      )
      .subscribe(this.update$);

    this.remove$
      .pipe(
        map<Todo['id'], TodosOperation>(
          (todoId) => (todos) => todos.filter(({ id }) => id !== todoId)
        )
      )
      .subscribe(this.update$);

    this.toggle$
      .pipe(
        map<Todo['id'], TodosOperation>((todoId) => (todos) => [
          ...todos.map((todo) =>
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
          ),
        ])
      )
      .subscribe(this.update$);

    this.toggleAll$
      .pipe(
        map<Todo['completed'], TodosOperation>(
          (completed) => (todos) =>
            todos.map((todo) => ({ ...todo, completed: completed }))
        )
      )
      .subscribe(this.update$);

    this.createNewTodo$.subscribe(this.create$);
    this.editTodo$.subscribe(this.edit$);
    this.removeCompletedTodo$.subscribe(this.removeCompleted$);
    this.removeTodo$.subscribe(this.remove$);
    this.toggleTodo$.subscribe(this.toggle$);
    this.toggleAllTodos$.subscribe(this.toggleAll$);
  }

  addTodo = (description: string) =>
    this.createNewTodo$.next(new Todo(description));
  edit = (todo: Todo) => {
    this.logger(`TodoService: edit todo: ${JSON.stringify(todo)}`);
    this.editTodo$.next(todo);
  };
  remove = (id: Todo['id']) => {
    this.logger(`TodoService: remove id: ${JSON.stringify(id)}`);
    return this.removeTodo$.next(id);
  };
  removeCompleted = () => {
    this.logger(`TodoService: remove completed`);
    this.removeCompletedTodo$.next(null);
  };
  toggle = (id: Todo['id']) => {
    this.logger(`TodoService: toggle id: ${id}`);
    this.toggleTodo$.next(id);
  };
  toggleAll = (completed: Todo['completed']) => {
    this.logger(`TodoService: toggle all: ${completed}`);
    this.toggleAllTodos$.next(completed);
  };

  getAllTodos = (): Observable<Todo[]> => {
    this.logger(`TodoService: getting todos`);
    return this.todos$;
  };

  getTodo = (todoId: Todo['id']): Observable<Todo> =>
    // Will 404 if id not found
    this.http.get<Todo>(`${this.todosUrl}/${todoId}`).pipe(
      tap((_) => this.logger(`TodoService: getting todo id : ${todoId}`)),
      catchError(this.handleError<Todo>(`getTodo id=${todoId}`))
    );
}
