import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription, Subject } from 'rxjs';
import { takeUntil, combineLatestWith } from 'rxjs/operators';

import Todo from './models/todo.model';

import { MessageService } from '../services/message.service';
import { TodoService } from '../services/todo.service';

import type { Filter } from './models/filter.model';

import gsap from 'gsap';
import { Draggable } from 'gsap/all';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss'],
})
export class TodosComponent implements AfterViewInit, OnInit, OnDestroy {
  private componentDestroyed$: Subject<boolean> = new Subject();

  currentFilter: Filter = 'all';

  public hasCount: boolean = false;
  public hasCompleted: boolean = false;
  public remainintCount: number = 0;
  public isAllCompleted: boolean = false;
  public visibleTodos: Todo[] = [];
  public todosSubscription!: Subscription;
  public filters: { text: Filter }[] = [
    { text: 'all' },
    { text: 'active' },
    { text: 'completed' },
  ];
  selectedTodo?: Todo;
  todos: Todo[] = [];

  newTodo: string = '';

  constructor(private todoServ: TodoService) {}
  onSelect = (todo: Todo) => (this.selectedTodo = todo);

  ngOnInit(): void {
    this.todosSubscription = this.todoServ
      .getAllTodos()
      .pipe(
        combineLatestWith(this.currentFilter),
        takeUntil(this.componentDestroyed$)
      )
      .subscribe(([todos, currentFilter]) => {
        this.todos = todos;
        this.hasCount = !!todos.length;
        this.hasCompleted = !!todos.filter(({ completed }) => completed).length;
        this.remainintCount = todos.filter(
          ({ completed }) => !completed
        ).length;
        this.isAllCompleted =
          todos.length === todos.filter(({ completed }) => completed).length;
        this.filterTodos(currentFilter as Filter);
      });
  }
  ngOnDestroy(): void {
    this.componentDestroyed$.next(true);
    this.componentDestroyed$.complete();
  }

  public filterTodos = (status: Filter) => {
    if (status === 'active')
      this.visibleTodos = this.todos.filter(({ completed }) => !completed);
    else if (status === 'completed')
      this.visibleTodos = this.todos.filter(({ completed }) => completed);
    else this.visibleTodos = this.todos;
  };

  public addTodo = (description: string) => {
    this.todoServ.addTodo(description);
    this.newTodo = '';
  };

  public toggle = (id: Todo['id']) => this.todoServ.toggle(id);
  public toggleAll = (completed: Todo['completed']) =>
    this.todoServ.toggleAll(completed);
  public update = (todo: Todo) => this.todoServ.edit(todo);
  public remove = (id: Todo['id']) => this.todoServ.remove(id);

  public removeCompleted = () => this.todoServ.removeCompleted();
  public handleFilterChange = ({ text }: { text: Filter }) => {
    this.currentFilter = text;
    this.filterTodos(this.currentFilter);
  };

  ngAfterViewInit() {
    this.initAnimation();
  }

  initAnimation = () => {
    gsap.registerPlugin(Draggable);
    const shadow1 =
      '0 1px 3px  0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)';
    const shadow2 =
      '0 6px 10px 0 rgba(0, 0, 0, 0.3), 0 2px 2px 0 rgba(0, 0, 0, 0.2)';

    const clamp = (value: number, a: number, b: number) =>
      value < a ? a : value > b ? b : value;

    const arrayMove = (array: any[], from: number, to: number) =>
      array.splice(to, 0, array.splice(from, 1)[0]);

    const Sortable = (el: Element, index: number) => {
      const content = el.querySelector('.todo-content');
      const order = el.querySelector('.todo-description');

      const animation = gsap.to(content, {
        boxShadow: shadow2,
        force3D: true,
        scale: 1.05,
        paused: true,
      });

      const layout = () =>
        gsap.to(el, { y: sortable.index * rowSize }).duration(0.3);

      const dragger = new Draggable(el, {
        onDragStart: function () {
          animation.play();
          this['update']();
        },
        onRelease: function () {
          animation.reverse();
          layout();
        },
        onDrag: function () {
          // Calculate the current index based on element's position
          const index = clamp(Math.round(this['y'] / rowSize), 0, total - 1);

          if (index !== sortable.index) {
            changeIndex(sortable, index);
          }
        },
        cursor: 'pointer',
        type: 'y',
      });

      const sortable = {
        dragger: dragger,
        element: el,
        index: index,
        setIndex: function (index: number) {
          this.index = index;
          if (order && order.textContent) {
            order.textContent = `${index + 1}`;
          }
          if (!dragger.isDragging) layout();
        },
      };

      return sortable;
    };
    const changeIndex = (
      sortable: {
        dragger: Draggable;
        element: Element;
        index: number;
        setIndex: (index: number) => void;
      },
      to: number
    ) => {
      arrayMove(sortables, sortable.index, to);

      if (to === total - 1) container?.appendChild(sortable.element);
      else
        container?.insertBefore(
          sortable.element,
          container.children[sortable.index > to ? to : to + 1]
        );
      sortables.forEach((sortable, index) => sortable.setIndex(index));
      //TODO: create a method on the todo service to update the new arrayMove
    };

    const rowSize = 100; // => container height / number of items
    const container = document.querySelector('.todos');
    const todosList = Array.from(document.querySelectorAll('.todo'));
    const sortables = todosList.map(Sortable); // Array of sortables
    const total = sortables.length;

    gsap.to(container, { autoAlpha: 1 }).duration(0.5);
  };
}
