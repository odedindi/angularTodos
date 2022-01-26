import {
  AfterViewInit,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import Todo from '../models/todo.model';
import { TodoService } from '../../services/todo.service';
import { MessageService } from '../../services/message.service';

import gsap from 'gsap';

@Component({
  selector: 'todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
})
export class TodoComponent implements AfterViewInit {
  editing: boolean = false;

  @Input() todo?: Todo;
  @Output() handleToggle = new EventEmitter();
  @Output() handleRemove = new EventEmitter();
  @Output() handleEdit = new EventEmitter();
  constructor(
    private messageServ: MessageService,
    private todoServ: TodoService
  ) {}

  toggle() {
    this.messageServ.add(
      `TodoComponent: toggle hero id=${this.todo?.completed}`
    );
    this.handleToggle.next(this.todo?.id);
  }
  edit() {
    this.editing = true;
  }
  cancelEditing() {
    this.editing = false;
  }
  update() {
    this.handleEdit.next(this.todo);
  }
  remove() {
    this.handleRemove.next(this.todo?.id);
  }

  save = (newDescription: string) => {
    if (this.todo) this.todo.description = newDescription;
    this.todo?.description.length ? this.update() : this.remove();
    this.editing = false;
  };

  ngAfterViewInit(): void {}


  // getTodo = (todoId: Todo['id']) =>
  //   this.todoServ.getTodo(todoId).subscribe((todo) => {
  //     console.log(todo);
  //     this.todo = todo;
  //   });

  // ngOnInit(): void {
  //   if (this.todo) {
  //     this.getTodo(this.todo.id);
  //   }
  // }
}
