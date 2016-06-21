/**
* @Author: Lim Mingjie, Kenneth <Astrianna>
* @Date:   2016-06-16T19:00:52-04:00
* @Email:  me@kenlimmj.com
* @Last modified time: 2016-06-20T16:37:38-04:00
* @License: MIT
*/

import { ChannelCountError, CoordinateRangeError } from './ColorError';
import { atan2d } from './trigDegreeLib';

const DEBUG = false;

/**
 * Checks if a provided color has valid coordinates in CIE L*a*b* space.
 *
 * Invariant: Assumes that the color is a valid 3-channel color, i.e. if there
 * are additional channels, they will be ignored.
 *
 * @method  _isValidLabColor
 * @param   {Color}           x   The 3-channel color to be tested
 * @return  {Array<boolean>}      True for every channel that is in L*a*b* space.
 */
export function _isValidLabColor([l, a, b]: Color): boolean[] {
  const lWithinRange: boolean = l >= 0 && l <= 100;
  const aWithinRange: boolean = a >= -128 && a <= 127;
  const bWithinRange: boolean = b >= -128 && b <= 127;

  return [lWithinRange, aWithinRange, bWithinRange];
}

/**
 * Throws an error if the provided color is not in CIE L*a*b* space.
 *
 * First checks if the input array has 3 elements corresponding to 3 channels,
 * then checks if each element is within the expected coordinate bounds.
 *
 * @method  _checkColor
 * @param   {Color}     x                       The color to be tested
 * @param   {boolean}   discardExcessChannels   Uses the first 3 elements in the `x` as the color if true
 * @return  {Color}                             The validated color
 */
export function _checkColor(x: number[], discardExcessChannels: boolean): Color {
  const NUM_CHANNELS = 3;
  let threeChannelColor: Color;

  // Verify that the color has NUM_CHANNELS channels
  if (x.length !== NUM_CHANNELS) {
    if (discardExcessChannels && x.length > NUM_CHANNELS) {
      threeChannelColor = x.slice(0, NUM_CHANNELS);

      if (DEBUG) {
        const actionStr = `Only using first ${NUM_CHANNELS} elements in ${x} because the \`discardExcessChannels\` flag is set to \`true\`.`; // eslint-disable-line max-len
        const confirmStr = `The final color used is ${threeChannelColor}.`;

        console.warn(actionStr + confirmStr); // eslint-disable-line no-console
      }
    } else {
      throw new ChannelCountError(x, NUM_CHANNELS);
    }
  } else {
    threeChannelColor = x;
  }

  // Verify that every color channel is within L*a*b* bounds
  const colorCoordTest: boolean[] = _isValidLabColor(threeChannelColor);
  if (!colorCoordTest.every(e => e)) throw new CoordinateRangeError(threeChannelColor, colorCoordTest);

  return threeChannelColor;
}

/**
 * ES7 decorator factory that applies `_checkColor` to the first two inputs of the
 * function being decorated, with the option to discard excess color channels.
 *
 * @method validateColorInputs
 * @param  {boolean}    discardExcessChannels   Discards excess elements in the color if true.
 *                                              'Excess' is defined as the 4th element onwards in the array
 */
export function validateColorInputs(discardExcessChannels: boolean = true) {
  return (target, name, descriptor) => {
    const originalFunc = descriptor.value;

    /* eslint-disable no-param-reassign */
    descriptor.value = (...args) => {
      // Validate the first 2 arguments as color inputs
      args[0] = _checkColor(args[0], discardExcessChannels);
      args[1] = _checkColor(args[1], discardExcessChannels);

      return originalFunc.apply(target, args);
    };
    /* eslint-enable no-param-reassign */
  };
}

/**
 * Converts a CIE L*a*b* color to a CIE L*C*H color.
 *
 * Note: The H channel is returned in degrees for compatibility
 * with the rest of the library (e.g. CIEDE2000 has a term $R_T$ which
 * does horribly when computed in radians because math is mysterious).
 *
 * @method  labToLch
 * @param   {Color}   x   The L*a*b* color to be converted
 * @return  {Color}       The L*C*H converted version of `x`
 */
export function labToLch([L, a, b]: Color): Color {
  const C: number = Math.sqrt(a * a + b * b);
  let H: number = C <= 0 ? 0 : atan2d(b, a);

  // Shift the H channel to within the range [0, 360]
  while (H >= 360) H -= 360;
  while (H < 0) H += 360;

  return [L, C, H];
}
