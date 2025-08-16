import { describe, it, expect } from '@jest/globals';

describe('Basic Test Suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test basic math operations', () => {
    expect(2 * 3).toBe(6);
    expect(10 / 2).toBe(5);
    expect(5 - 3).toBe(2);
  });

  it('should test string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
    expect('world'.length).toBe(5);
  });

  it('should test array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });

  it('should test object operations', () => {
    const obj = { name: 'Test', value: 42 };
    expect(obj.name).toBe('Test');
    expect(obj.value).toBe(42);
  });
});