/**
* @Author: Lim Mingjie, Kenneth <Astrianna>
* @Date:   2016-06-16T18:24:07-04:00
* @Email:  me@kenlimmj.com
* @Last modified time: 2016-06-20T18:12:00-04:00
* @License: MIT
* @flow
*/

export class ColorError extends Error {
  // NOTE: Requires babel-plugin-transform-builtin-extend for Babel 6 in order
  // for class inheritance to work properly.
  constructor(message: string = '') {
    super(message);

    this.message = message;
    this.name = this.constructor.name;

    // Inject custom error inheritance into the stack trace
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export class ChannelCountError extends ColorError {
  constructor(x: number[], expectedNumChannels: number) {
    const errStr = `Expected ${expectedNumChannels} color channels but saw ${x.length} channels (${x.join(', ')}) instead.`;
    const recStr = 'Consider discarding an alpha channel if it exists';

    super(`${errStr} ${recStr}`);
  }
}

export class CoordinateRangeError extends ColorError {
  constructor([l, a, b]: Color, [lCheck, aCheck, bCheck]: boolean[]) {
    const err: string[] = [];

    // Identify which channels are out-of-bounds
    if (!lCheck) err.push(`Expected l* = ${l} to be within the range [0, 100].`);
    if (!aCheck) err.push(`Expected a* = ${a} to be within the range [-128, 127].`);
    if (!bCheck) err.push(`Expected b* = ${b} to be within the range [-128, 127].`);

    super(`${err.join('\n')}\nCheck if the input has been correctly converted to L*a*b* space?`);
  }
}
