/**
 * EventEmitter
 * Simple event emitter pattern for component communication
 *
 * @class EventEmitter
 * @example
 * class MyComponent extends EventEmitter {
 *   doSomething() {
 *     this.emit('something', { data: 'value' });
 *   }
 * }
 *
 * const component = new MyComponent();
 * component.on('something', (data) => console.log(data));
 */

export class EventEmitter {
  constructor() {
    this._events = new Map();
  }

  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }

    this._events.get(event).push(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Register a one-time event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };

    return this.on(event, onceWrapper);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (!this._events.has(event)) return;

    const listeners = this._events.get(event);
    const index = listeners.indexOf(callback);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // Clean up empty arrays
    if (listeners.length === 0) {
      this._events.delete(event);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    if (!this._events.has(event)) return;

    const listeners = this._events.get(event);

    // Call all listeners with data
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event (or all events)
   * @param {string} [event] - Event name (optional)
   */
  removeAllListeners(event) {
    if (event) {
      this._events.delete(event);
    } else {
      this._events.clear();
    }
  }

  /**
   * Get number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    return this._events.has(event) ? this._events.get(event).length : 0;
  }

  /**
   * Get array of event names with registered listeners
   * @returns {string[]} Array of event names
   */
  eventNames() {
    return Array.from(this._events.keys());
  }
}

export default EventEmitter;
