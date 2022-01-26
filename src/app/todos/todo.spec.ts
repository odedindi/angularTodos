import Todo from './todo.model';

const mockDescription = 'mockDescription';

describe('Todo', () => {
  it('should create an instance', () => {
    expect(new Todo(mockDescription)).toBeTruthy();
  });
});
