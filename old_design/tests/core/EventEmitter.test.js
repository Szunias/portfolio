/**
 * Tests for EventEmitter
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventEmitter } from '../../assets/js/refactored/core/EventEmitter.js';

describe('EventEmitter', () => {
  let emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('on()', () => {
    it('should register event listener', () => {
      const callback = vi.fn();
      emitter.on('test', callback);

      emitter.emit('test', { data: 'value' });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ data: 'value' });
    });

    it('should register multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);

      emitter.emit('test');

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should return cleanup function', () => {
      const callback = vi.fn();
      const cleanup = emitter.on('test', callback);

      expect(typeof cleanup).toBe('function');

      emitter.emit('test');
      expect(callback).toHaveBeenCalledTimes(1);

      cleanup();

      emitter.emit('test');
      expect(callback).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  describe('once()', () => {
    it('should trigger callback only once', () => {
      const callback = vi.fn();
      emitter.once('test', callback);

      emitter.emit('test');
      emitter.emit('test');
      emitter.emit('test');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should pass data to callback', () => {
      const callback = vi.fn();
      emitter.once('test', callback);

      emitter.emit('test', { value: 42 });

      expect(callback).toHaveBeenCalledWith({ value: 42 });
    });

    it('should return cleanup function', () => {
      const callback = vi.fn();
      const cleanup = emitter.once('test', callback);

      cleanup();

      emitter.emit('test');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('off()', () => {
    it('should remove specific listener', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);

      emitter.off('test', callback1);

      emitter.emit('test');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if event does not exist', () => {
      const callback = vi.fn();

      expect(() => {
        emitter.off('nonexistent', callback);
      }).not.toThrow();
    });

    it('should do nothing if callback not registered', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      emitter.on('test', callback1);

      expect(() => {
        emitter.off('test', callback2);
      }).not.toThrow();

      emitter.emit('test');
      expect(callback1).toHaveBeenCalledTimes(1);
    });
  });

  describe('emit()', () => {
    it('should emit event to all listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);
      emitter.on('other', callback3);

      emitter.emit('test', { data: 'value' });

      expect(callback1).toHaveBeenCalledWith({ data: 'value' });
      expect(callback2).toHaveBeenCalledWith({ data: 'value' });
      expect(callback3).not.toHaveBeenCalled();
    });

    it('should do nothing if no listeners registered', () => {
      expect(() => {
        emitter.emit('nonexistent');
      }).not.toThrow();
    });

    it('should handle errors in callbacks', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      emitter.on('test', errorCallback);
      emitter.on('test', normalCallback);

      emitter.emit('test');

      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should pass data to callbacks', () => {
      const callback = vi.fn();
      emitter.on('test', callback);

      const data = {
        string: 'value',
        number: 42,
        boolean: true,
        object: { nested: 'data' },
        array: [1, 2, 3]
      };

      emitter.emit('test', data);

      expect(callback).toHaveBeenCalledWith(data);
    });

    it('should work with no data', () => {
      const callback = vi.fn();
      emitter.on('test', callback);

      emitter.emit('test');

      expect(callback).toHaveBeenCalledWith(undefined);
    });
  });

  describe('removeAllListeners()', () => {
    it('should remove all listeners for specific event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      emitter.on('test', callback1);
      emitter.on('test', callback2);
      emitter.on('other', callback3);

      emitter.removeAllListeners('test');

      emitter.emit('test');
      emitter.emit('other');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it('should remove all listeners if no event specified', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      emitter.on('test', callback1);
      emitter.on('other', callback2);

      emitter.removeAllListeners();

      emitter.emit('test');
      emitter.emit('other');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount()', () => {
    it('should return number of listeners for event', () => {
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      emitter.on('other', () => {});

      expect(emitter.listenerCount('test')).toBe(2);
      expect(emitter.listenerCount('other')).toBe(1);
      expect(emitter.listenerCount('nonexistent')).toBe(0);
    });
  });

  describe('eventNames()', () => {
    it('should return array of event names', () => {
      emitter.on('test1', () => {});
      emitter.on('test2', () => {});
      emitter.on('test2', () => {});

      const names = emitter.eventNames();

      expect(names).toContain('test1');
      expect(names).toContain('test2');
      expect(names).toHaveLength(2);
    });

    it('should return empty array if no listeners', () => {
      expect(emitter.eventNames()).toEqual([]);
    });
  });

  describe('Integration', () => {
    it('should work with complex event chains', () => {
      const results = [];

      emitter.on('step1', (data) => {
        results.push('step1');
        emitter.emit('step2', { ...data, step: 2 });
      });

      emitter.on('step2', (data) => {
        results.push('step2');
        emitter.emit('step3', { ...data, step: 3 });
      });

      emitter.on('step3', (data) => {
        results.push('step3');
        expect(data.step).toBe(3);
      });

      emitter.emit('step1', { initial: true });

      expect(results).toEqual(['step1', 'step2', 'step3']);
    });

    it('should handle many listeners efficiently', () => {
      const callbacks = Array.from({ length: 100 }, () => vi.fn());

      callbacks.forEach(cb => emitter.on('test', cb));

      emitter.emit('test', { data: 'value' });

      callbacks.forEach(cb => {
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith({ data: 'value' });
      });
    });
  });
});
