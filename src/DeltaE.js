/**
* @Author: Lim Mingjie, Kenneth <Astrianna>
* @Date:   2016-06-10T17:40:54-04:00
* @Email:  me@kenlimmj.com
* @Last modified time: 2016-06-20T18:09:22-04:00
* @License: MIT
* @flow
*/

import { labToLch, validateColorInputs } from './colorUtils';
import { sind, cosd, atan2d } from './trigDegreeLib';

/**
 * Maps an application type to the corresponding $k_l$ value.
 *
 * For graphic arts, $k_l = 1$. For textiles, $k_l = 2$.
 * Any other values default to 'graphicArts', i.e. $k_l = 1$.
 *
 * @method  getklValueFromType
 * @param   {string}   applicationType   Either 'graphicArts' or 'textiles'
 * @return  {number}                     The corresponding $k_l$ value
 */
export function getklValueFromType(applicationType: string): number {
  switch (applicationType) {
    case 'textiles':
      return 2;
    case 'graphicArts':
    default:
      return 1;
  }
}

export default class DeltaE {
  /**
   * From Wikipedia:
   * The 1976 formula is the first color-difference formula that related a measured
   * to a known set of CIELAB coordinates. This formula has been succeeded by the
   * 1994 and 2000 formulas because the CIELAB space turned out to be not as perceptually
   * uniform as intended, especially in the saturated regions. This means that this formula
   * rates these colors too highly as opposed to other colors.
   *
   * @method  cie1976
   * @param   {Color}   x   The first color in L*a*b* space
   * @param   {Color}   y   The second color in L*a*b* space
   * @return  {number}      The ∆E between the two colors
   */
  @validateColorInputs(false)
  static cie1976([l1, a1, b1]: Color, [l2, a2, b2]: Color): number {
    // Compute Euclidean distance
    const lDiff: number = l2 - l1;
    const aDiff: number = a2 - a1;
    const bDiff: number = b2 - b1;

    return Math.sqrt(lDiff * lDiff + aDiff * aDiff + bDiff * bDiff);
  }

  /**
   * If `applicationType` is not specified, it defaults to 'graphicArts'.
   *
   * From Wikipedia:
   * The 1976 definition was extended to address perceptual non-uniformities,
   * while retaining the L*a*b* color space, by the introduction of application-
   * specific weights derived from an automotive paint test's tolerance data.
   *
   * @method  cie1994
   * @param   {Color}   x                 The reference color in L*a*b* space
   * @param   {Color}   y                 The sample color in L*a*b* space
   * @param   {string}  applicationType   Weighing factors. Possible values: *'graphicArts'*, 'textiles'.
   * @return  {number}                    The ∆E between the two colors
   */
  @validateColorInputs(false)
  static cie1994([l1, a1, b1]: Color, [l2, a2, b2]: Color, applicationType: string = 'graphicArts'): number {
    const kl: number = getklValueFromType(applicationType);
    const kc: number = 1;
    const kh: number = 1;

    let k1: number;
    let k2: number;

    switch (applicationType) {
      case 'textiles':
        k1 = 0.048;
        k2 = 0.014;
        break;
      case 'graphicArts':
      default:
        k1 = 0.045;
        k2 = 0.015;
        break;
    }

    const c1: number = Math.sqrt(a1 * a1 + b1 * b1);
    const c2: number = Math.sqrt(a2 * a2 + b2 * b2);

    const deltaA: number = a1 - a2;
    const deltaB: number = b1 - b2;
    const deltaC: number = c1 - c2;
    const deltaH: number = Math.sqrt(deltaA * deltaA + deltaB * deltaB - deltaC * deltaC);
    const deltaL: number = l1 - l2;

    const sl: number = 1;
    const sc: number = 1 + k1 * c1;
    const sh: number = 1 + k2 * c2;

    const firstTerm: number = deltaL / (kl * sl);
    const secondTerm: number = deltaC / (kc * sc);
    const thirdTerm: number = deltaH / (kh * sh);

    return Math.sqrt(firstTerm * firstTerm + secondTerm * secondTerm + thirdTerm * thirdTerm);
  }

  /**
   * If `applicationType` is not specified, it defaults to 'graphicArts'.
   *
   * From Wikipedia:
   * Since the 1994 definition did not adequately resolve the perceptual
   * uniformity issue, the CIE refined their definition, adding five corrections:
   *
   * - A hue rotation term (R_T), to deal with the problematic
   * 	 blue region (hue angles in the neighborhood of 275°)
   * - Compensation for neutral colors (the primed values in the L*C*h differences)
   * - Compensation for lightness (S_L)
   * - Compensation for chroma (S_C)
   * - Compensation for hue (S_H)
   *
   * @method  ciede2000
   * @param   {Color}   x                 The reference color in L*a*b* space
   * @param   {Color}   y                 The sample color in L*a*b* space
   * @return  {number}                    The ∆E between the two colors
   */
  @validateColorInputs(false)
  static ciede2000([l1, a1, b1]: Color, [l2, a2, b2]: Color): number {
    const [_1, c1, __1]: Color = labToLch([l1, a1, b1]);
    const [_2, c2, __2]: Color = labToLch([l2, a2, b2]);

    const deltaLPrime: number = l2 - l1;

    const lBar: number = (l1 + l2) / 2;
    const cBar: number = (c1 + c2) / 2;

    const cBarPow7: number = Math.pow(cBar, 7);
    const cCoeff: number = Math.sqrt(cBarPow7 / (cBarPow7 + Math.pow(25, 7)));
    const a1Prime: number = a1 + (a1 / 2) * (1 - cCoeff);
    const a2Prime: number = a2 + (a2 / 2) * (1 - cCoeff);

    const c1Prime: number = Math.sqrt(a1Prime * a1Prime + b1 * b1);
    const c2Prime: number = Math.sqrt(a2Prime * a2Prime + b2 * b2);
    const cBarPrime: number = (c1Prime + c2Prime) / 2;
    const deltaCPrime: number = c2Prime - c1Prime;

    let h1Prime: number;
    if (a1Prime === 0 && b1 === 0) {
      h1Prime = 0;
    } else {
      h1Prime = atan2d(b1, a1Prime) % 360;
    }

    let h2Prime: number;
    if (a2Prime === 0 && b2 === 0) {
      h2Prime = 0;
    } else {
      h2Prime = atan2d(b2, a2Prime) % 360;
    }

    let deltaSmallHPrime: number;
    let deltaBigHPrime: number;
    let hBarPrime: number;

    if (c1Prime === 0 || c2Prime === 0) {
      deltaSmallHPrime = 0;
      deltaBigHPrime = 0;
      hBarPrime = h1Prime + h2Prime;
    } else {
      if (Math.abs(h1Prime - h2Prime) <= 180) {
        deltaSmallHPrime = h2Prime - h1Prime;
      } else {
        if (h2Prime <= h1Prime) {
          deltaSmallHPrime = h2Prime - h1Prime + 360;
        } else {
          deltaSmallHPrime = h2Prime - h1Prime - 360;
        }
      }

      deltaBigHPrime = 2 * Math.sqrt(c1Prime * c2Prime) * sind(deltaSmallHPrime / 2);

      if (Math.abs(h1Prime - h2Prime) <= 180) {
        hBarPrime = (h1Prime + h2Prime) / 2;
      } else {
        if ((h1Prime + h2Prime) < 360) {
          hBarPrime = (h1Prime + h2Prime + 360) / 2;
        } else {
          hBarPrime = (h1Prime + h2Prime - 360) / 2;
        }
      }
    }

    const T: number = 1 - 0.17 * cosd(hBarPrime - 30) +
                          0.24 * cosd(2 * hBarPrime) +
                          0.32 * cosd(3 * hBarPrime + 6) -
                          0.2 * cosd(4 * hBarPrime - 63);

    const slCoeff: number = (lBar - 50) * (lBar - 50);
    const sl: number = 1 + (0.015 * slCoeff) / Math.sqrt(20 + slCoeff);
    const sc: number = 1 + 0.045 * cBarPrime;
    const sh: number = 1 + 0.015 * cBarPrime * T;

    const RtCoeff: number = 60 * Math.exp(-((hBarPrime - 275) / 25) * ((hBarPrime - 275) / 25));
    const Rt: number = -2 * cCoeff * sind(RtCoeff);

    const kl: number = 1;
    const kc: number = 1;
    const kh: number = 1;

    const firstTerm: number = deltaLPrime / (kl * sl);
    const secondTerm: number = deltaCPrime / (kc * sc);
    const thirdTerm: number = deltaBigHPrime / (kh * sh);
    const fourthTerm: number = Rt * secondTerm * thirdTerm;

    return Math.sqrt(firstTerm * firstTerm + secondTerm * secondTerm + thirdTerm * thirdTerm + fourthTerm);
  }

  /**
   * If `thresholdType` is not specified, it defaults to 'acceptability'.
   *
   * From Wikipedia:
   * In 1984, the Colour Measurement Committee (CMC) of the Society of Dyers and
   * Colourists (SDC) defined a difference measure, also based on the L*C*h color model.
   * Named after the developing committee, their metric is called CMC l:c.
   *
   * The quasimetric has two threshold parameters: lightness (l) and chroma (c), allowing the
   * users to weight the difference based on the ratio of l:c that is deemed appropriate
   * for the application.
   *
   * Commonly used values are 2:1 for acceptability and 1:1 for the threshold of imperceptibility.
   *
   * @method  cmc1984
   * @param   {Color}   x                 The first color in L*a*b* space
   * @param   {Color}   y                 The second color in L*a*b* space
   * @param   {string}  thresholdType     Quasimetric parameter weight (l:c ratio).
   *                                      Possible values: *'acceptability'*, 'imperceptibility'.
   * @return  {number}                    The ∆E between the two colors
   */
  @validateColorInputs(false)
  static cmc1984([l1, a1, b1]: Color, [l2, a2, b2]: Color, thresholdType: string = 'acceptability'): number {
    let l: number;
    let c: number;

    switch (thresholdType) {
      case 'acceptability':
        l = 2;
        c = 1;
        break;
      case 'imperceptibility':
      default:
        l = 1;
        c = 1;
        break;
    }

    const [_1, c1, h1]: Color = labToLch([l1, a1, b1]);
    const [_2, c2, __2]: Color = labToLch([l2, a2, b2]);

    const c1Pow4: number = c1 * c1 * c1 * c1;
    const F: number = Math.sqrt(c1Pow4 / (c1Pow4 + 1900));

    let T: number;
    if (h1 >= 164 && h1 <= 345) {
      T = 0.56 + Math.abs(0.2 * cosd(h1 + 168));
    } else {
      T = 0.36 + Math.abs(0.4 * cosd(h1 + 35));
    }

    const sl: number = l1 < 16 ? 0.511 : (0.040975 * l1) / (1 + 0.01765 * l1);
    const sc: number = ((0.0638 * c1) / (1 + 0.0131 * c1)) + 0.638;
    const sh: number = sc * (F * T + 1 - F);

    const deltaA: number = a1 - a2;
    const deltaB: number = b1 - b2;
    const deltaC: number = c1 - c2;
    const deltaH: number = Math.sqrt(deltaA * deltaA + deltaB * deltaB - deltaC * deltaC);

    const firstTerm: number = (l1 - l2) / (l * sl);
    const secondTerm: number = (c1 - c2) / (c * sc);
    const thirdTerm: number = deltaH / sh;

    return Math.sqrt(firstTerm * firstTerm + secondTerm * secondTerm + thirdTerm * thirdTerm);
  }
}
