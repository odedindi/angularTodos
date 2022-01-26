import { Injectable } from '@angular/core';

import { InMemoryDbService } from 'angular-in-memory-web-api';

import Todo from '../todos/models/todo.model';
import { TODOS } from '../todos/mock-todos';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService {
  constructor() {}

  storage = {
    storageName: 'myAngularTodos',
    get: function (): Todo[] {
      const data = localStorage.getItem(this.storageName);
      if (data) {
        console.log('localStorage get data parsed: ', JSON.parse(data!));
        return JSON.parse(data);
      }
      return TODOS(10);
      // return data ? JSON.parse(data) : TODOS;
    },
    set: function (item: string | any): void {
      console.log('update localStorage with: ', item);
      typeof item === 'string'
        ? localStorage.setItem(this.storageName, item)
        : localStorage.setItem(this.storageName, JSON.stringify(item));
    },
  };

  createDb = () => ({ todos: this.storage.get() });
}
