/**
* @Author: Lim Mingjie, Kenneth <Astrianna>
* @Date:   2016-06-15T17:15:36-04:00
* @Email:  me@kenlimmj.com
* @Last modified time: 2016-06-20T20:36:57-04:00
* @License: MIT
*/

import 'babel-polyfill';
import test from 'ava-spec';
import DeltaE, { getklValueFromType } from '../lib/DeltaE';

import { _isValidLabColor, _checkColor, labToLch }  from '../lib/colorUtils';
import { _radToDeg, _degToRad, cosd, sind, atan2d } from '../lib/trigDegreeLib';
import { ColorError, ChannelCountError, CoordinateRangeError }  from '../lib/ColorError';

test.group('colorUtils.js:', funcTest => {
  funcTest.group('_isValidLabColor', unitTest => {
    unitTest('should detect OOB L* color', t => {
      t.deepEqual(_isValidLabColor([200, 0, 0]), [false, true, true]);
    });

    unitTest('should detect OOB a* color', t => {
      t.deepEqual(_isValidLabColor([50, 200, 0]), [true, false, true]);
    });

    unitTest('should detect OOB b* color', t => {
      t.deepEqual(_isValidLabColor([50, 0, 200]), [true, true, false]);
    });
  });

  funcTest.group('_checkColor', unitTest => {
    unitTest('should throw `ChannelCountError` for colors with >3 channels and `discardExcessChannels` set to false.', t => {
      t.throws(() => _checkColor([1, 2, 3, 4], false), ChannelCountError);
    });

    unitTest('should throw `ChannelCountError` for colors with <3 channels and `discardExcessChannels` set to false.', t => {
      t.throws(() => _checkColor([1, 2], false), ChannelCountError);
    });

    unitTest('should return 3 channels for colors with >3 channels and `discardExcessChannels` set to true.', t => {
      t.deepEqual(_checkColor([1, 2, 3, 4], true), [1, 2, 3]);
    });

    unitTest('should throw `ChannelCountError` for colors with <3 channels and `discardExcessChannels` set to true.', t => {
      t.throws(() => _checkColor([1, 2], true), ChannelCountError);
    });

    unitTest('should throw `CoordinateRangeError` for colors not in L*a*b* space', t => {
      t.throws(() => _checkColor([200, 200, 200]), CoordinateRangeError);
    });

    unitTest('should passthrough correct/valid colors', t => {
      t.deepEqual(_checkColor([50, 0, 0]), [50, 0, 0]);
    });
  });

  funcTest.group('labToLch', unitTest => {
    unitTest('should correctly convert L*a*b color to L*C*H* color', t => {
      t.deepEqual(labToLch([93, -1, 25]).map(Math.round), [93, 25, 92]);
    });
  });
});

test.group('trigDegreeLib.js:', funcTest => {
  funcTest.group('_radToDeg', unitTest => {
    unitTest('should return the correct value for 0', t => {
      t.is(_radToDeg(0), 0);
    });

    unitTest('should return the correct value for π', t => {
      t.is(_radToDeg(Math.PI), 180);
    });
  });

  funcTest.group('_degToRad', unitTest => {
    unitTest('should return the correct value for 0', t => {
      t.is(_degToRad(0), 0);
    });

    unitTest('should return the correct value for 180°', t => {
      t.is(_degToRad(180), Math.PI);
    });
  });

  funcTest.group('cosd', unitTest => {
    unitTest('should return the correct value for 0', t => {
      t.is(cosd(0), 1);
    });

    unitTest('should return the correct value for 180°', t => {
      t.is(cosd(180), -1);
    });
  });

  funcTest.group('sind', unitTest => {
    unitTest('should return the correct value for 0', t => {
      t.is(sind(0), 0);
    });

    unitTest('should return the correct value for 90°', t => {
      t.is(sind(90), 1);
    });
  });

  funcTest.group('atan2d', unitTest => {
    unitTest('should return the correct value for b = -1 and a = 1', t => {
      t.is(atan2d(-1, 1), -45);
    });

    unitTest('should return the correct value for b = 1 and a = 1', t => {
      t.is(atan2d(1, 1), 45);
    });

    unitTest('should return the correct value for b = 0 and a = 0', t => {
      t.is(atan2d(0, 0), 0);
    });
  });
});

test.group('ColorError.js', funcTest => {
  funcTest.group('ColorError', unitTest => {
    const err = new ColorError('test');

    unitTest('should return the correct message', t => {
      t.is(err.message, 'test');
    });

    unitTest('should inherit correctly from Error', t => {
      t.is(err.name, 'ColorError');
    });
  });

  funcTest.group('ChannelCountError', unitTest => {
    unitTest('should return the correct message', t => {
      const msg = 'Expected 3 color channels but saw 4 channels (1, 2, 3, 4) instead. Consider discarding an alpha channel if it exists';
      t.is(new ChannelCountError([1, 2, 3, 4], 3).message, msg);
    });

    unitTest('should inherit correctly from ColorError', t => {
      t.is(new ChannelCountError([1, 2, 3, 4]).name, 'ChannelCountError');
    });
  });

  funcTest.group('CoordinateRangeError', unitTest => {
    const recMsg = 'Check if the input has been correctly converted to L*a*b* space?';

    unitTest('should return the correct message for OOB L*', t => {
      const err = new CoordinateRangeError([200, 0, 0], [false, true, true]);
      const assertMsg = 'Expected l* = 200 to be within the range [0, 100].';
      t.is(err.message, `${assertMsg}\n${recMsg}`);
    });

    unitTest('should return the correct message for OOB a*', t => {
      const err = new CoordinateRangeError([50, 254, 0], [true, false, true]);
      const assertMsg = 'Expected a* = 254 to be within the range [-128, 127].';
      t.is(err.message, `${assertMsg}\n${recMsg}`);
    });

    unitTest('should return the correct message for OOB b*', t => {
      const err = new CoordinateRangeError([50, 0, 254], [true, true, false]);
      const assertMsg = 'Expected b* = 254 to be within the range [-128, 127].';
      t.is(err.message, `${assertMsg}\n${recMsg}`);
    });
  });
});

test.group('DeltaE.js', funcTest => {
  funcTest.group('getklValueFromType', unitTest => {
    unitTest('should return 1 for \'graphicArts\'', t => {
      t.is(getklValueFromType('graphicArts'), 1);
    });

    unitTest('should return 2 for \'textiles\'', t => {
      t.is(getklValueFromType('textiles'), 2);
    });

    unitTest('should return 1 for unrecognized inputs', t => {
      t.is(getklValueFromType('foobar'), 1);
    });
  });

  funcTest.group('cie1976', unitTest => {
    unitTest('should catch bad input in first position', t => {
      t.throws(() => {
        DeltaE.cie1976([0, 0, 0, 0], [50, 60, 48]);
      }, ChannelCountError);
    });

    unitTest('should catch bad input in second position', t => {
      t.throws(() => {
        DeltaE.cie1976([50, 60, 48], [0, 0, 0, 0]);
      }, ChannelCountError);
    });

    unitTest('should return 0 for identical colors', t => {
      t.is(DeltaE.cie1976([0, 0, 0], [0, 0, 0]), 0);
    });

    unitTest('should return the correct value', t => {
      t.is(parseFloat(DeltaE.cie1976([50, 25, 39], [80, 12, 93]).toFixed(3)), 63.127);
    });
  });

  funcTest.group('cie1994', unitTest => {
    unitTest('should catch bad input in first position', t => {
      t.throws(() => {
        DeltaE.cie1994([0, 0, 0, 0], [50, 60, 48]);
      }, ChannelCountError);
    });

    unitTest('should catch bad input in second position', t => {
      t.throws(() => {
        DeltaE.cie1994([50, 60, 48], [0, 0, 0, 0]);
      }, ChannelCountError);
    });

    unitTest('should return 0 for identical colors', t => {
      t.is(DeltaE.cie1994([0, 0, 0], [0, 0, 0]), 0);
    });

    unitTest('should return the correct value for default application', t => {
      t.is(parseFloat(DeltaE.cie1994([55, 60, 48], [55, 65, 53]).toFixed(2)), 1.61);
    });

    unitTest('should return the correct value for \'graphicArts\'', t => {
      t.is(parseFloat(DeltaE.cie1994([55, 60, 48], [55, 65, 53], 'graphicArts').toFixed(2)), 1.61);
    });

    unitTest('should return the correct value for \'textiles\'', t => {
      t.is(parseFloat(DeltaE.cie1994([55, 60, 48], [55, 65, 53], 'textiles').toFixed(2)), 1.54);
    });
  });

  funcTest.group('ciede2000', unitTest => {
    unitTest('should catch bad input in first position', t => {
      t.throws(() => {
        DeltaE.ciede2000([0, 0, 0, 0], [50, 60, 48]);
      }, ChannelCountError);
    });

    unitTest('should catch bad input in second position', t => {
      t.throws(() => {
        DeltaE.ciede2000([50, 60, 48], [0, 0, 0, 0]);
      }, ChannelCountError);
    });

    unitTest('should return 0 for identical colors', t => {
      t.is(DeltaE.ciede2000([0, 0, 0], [0, 0, 0]), 0);
    });

    unitTest('should return the correct value', t => {
      t.is(parseFloat(DeltaE.ciede2000([55, 60, 48], [55, 65, 53]).toFixed(2)), 1.58);
    });
  });

  funcTest.group('cmc1984', unitTest => {
    unitTest('should catch bad input in first position', t => {
      t.throws(() => {
        DeltaE.cmc1984([0, 0, 0, 0], [50, 60, 48]);
      }, ChannelCountError);
    });

    unitTest('should catch bad input in second position', t => {
      t.throws(() => {
        DeltaE.cmc1984([50, 60, 48], [0, 0, 0, 0]);
      }, ChannelCountError);
    });

    unitTest('should return 0 for identical colors', t => {
      t.is(DeltaE.cmc1984([0, 0, 0], [0, 0, 0]), 0);
    });

    unitTest('should return the correct value for default threshold', t => {
      t.is(parseFloat(DeltaE.cmc1984([55, 60, 48], [55, 65, 53]).toFixed(3)), 2.339);
    });

    unitTest('should return the correct value for \'acceptability\'', t => {
      t.is(parseFloat(DeltaE.cmc1984([55, 60, 48], [55, 65, 53], 'acceptability').toFixed(3)), 2.339);
    });

    unitTest('should return the correct value for \'imperceptibility\'', t => {
      t.is(parseFloat(DeltaE.cmc1984([55, 60, 48], [55, 65, 53], 'imperceptibility').toFixed(3)), 2.339);
    });
  });
});
