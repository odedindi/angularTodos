import { Component, OnInit } from '@angular/core';

import { combineLatestWith, map, take } from 'rxjs/operators';

import Todo from '../todos/models/todo.model';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private todoServ: TodoService) {}
  todos: Todo[] = [];

  getTodos = () => {
    this.todoServ.getAllTodos().subscribe((todos) => {
      this.todos = todos.slice(0, 5);
    });
  };

  ngOnInit(): void {
    this.getTodos();
  }
}
