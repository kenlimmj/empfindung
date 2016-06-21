<!--
@Author: Lim Mingjie, Kenneth <Astrianna>
@Date:   2016-06-20T20:35:31-04:00
@Email:  me@kenlimmj.com
@Last modified by:   Astrianna
@Last modified time: 2016-06-20T22:57:42-04:00
@License: MIT
-->

empfindung
==========

A library for calculating the perceptual difference between colors (∆E). _Empfindung_ is German for 'sensation', and its use in the context of color difference measurement stems from the ilk of Messrs. Hermann von Helmhotz and Ewald Hering.

The following measurements are supported:

- CIE76 (1976)
- CIE94 (1994)
- CIEDE2000 (2000)
- CMC l:c (1984)

All calculations are performed in either L*a*b or L*C*H* space (as the metrics prescribe).

## Motivation
[Mike Bostock](https://bost.ocks.org/mike/) created a visualization measuring the perceptual uniformity of color scales by calculating the CIE76 color difference metric at every point in the scale. His closing remarks were that the CIEDE2000 metric would be a better choice (because science), but "I'm lazy".

Why, we exist only to serve!

A closer look reveals that the CIEDE2000 calculations are... [numerous](https://www.wikiwand.com/en/Color_difference#/CIEDE2000). But we bravely proceed. Another attempt already exists [here](https://github.com/markusn/color-diff), but it does not implement the rest of the metrics. This version implements everything on the Wikipedia page with good test coverage.

## Quick Start

This library is available on NPM, like so:

```shell
npm install --save empfindung
```

To use it, simply require the package:

```javascript
import DeltaE from empfindung;

DeltaE.cie1976([50, 25, 39], [80, 12, 93]);                   // returns ~63.127
DeltaE.cie1994([55, 60, 48], [55, 65, 53], 'graphicArts');    // returns ~1.61
DeltaE.cie1994([55, 60, 48], [55, 65, 53], 'textiles');       // returns ~1.54
DeltaE.ciede2000([55, 60, 48], [55, 65, 53]);                 // returns ~1.58
DeltaE.cmc1984([55, 60, 48], [55, 65, 53], 'acceptability');  // returns ~2.339
DeltaE.cmc1984([55, 60, 48], [55, 65, 53], 'imperceptibility');  // returns ~2.339
```

Tests and code coverage use [ava](https://github.com/avajs/ava) and [nyc](https://github.com/bcoe/nyc) respectively. Running `npm test` will do the honors.

Code style is enforced using [ESLint](http://eslint.org/), and running `npm run prebuild` will lint the source files in an ES6-compliant manner.

## Usage

_Detailed JSDoc comments accompany each function inline, if you so desire._

The color difference metrics are implemented via the following functions:

- CIE76: `cie1976(a, b)`
- CIE94: `cie1994(ref, sample, [applicationType])`
- CIEDE2000: `ciede2000(ref, sample)`
- CMC l:c: `cmc1984(a, b, [threshold])`

The first two inputs for any function (`a` and `b`, or `ref` and `sample`) should be a pair of arrays corresponding to 3-channel colors in L*a*b* space. The nomenclature is exactly `[L, A, B]`. If a color with more than 3 channels is provided (normally because there is some kind of opacity/alpha channel that wasn't stripped), `ChannelCountError` will be thrown. If each channel falls outside the acceptable domain (normally because the color has not been converted from RGB), `CoordinateRangeError` will be thrown.

CIE94 and CIEDE2000 are asymmetric measurements, hence the first input is the reference color (`ref`), and the second input is the sampled color (`sample`).

CIE94 and CMC l:c also accept an optional parameter adjusting the metric for the kind of quasimetric being evaluated. CIE94 offers an application type choice (via `applicationType`) of either **'graphicArts'** or 'textiles' for their eponymous use. CMC l:c offers a threshold choice (via `threshold`) of either **'acceptability'** or 'imperceptibility' that nuances the just-noticeable difference between the colors. In both cases, the bolded option is the default if nothing is specified.

## Versioning

Development will be maintained under the Semantic Versioning guidelines as much as possible in order to ensure transparency and backwards compatibility.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

+ Breaking backward compatibility bumps the major (and resets the minor and patch)
+ New additions without breaking backward compatibility bump the minor (and resets the patch)
+ Bug fixes and miscellaneous changes bump the patch

For more information on SemVer, visit http://semver.org/.

## Bug Tracking and Feature Requests

Have a bug or a feature request? [Please open a new issue](https://github.com/kenlimmj/empfindung/issues).

Before opening any issue, please search for existing issues and read the [Issue Guidelines](CONTRIBUTING.md).

## Contributing

Please submit all pull requests against \*-wip branches. All code should pass ESLint validation using the `.eslintrc` file that is provided. To make life easy for everyone, use indentation guidelines specified in `.editorconfig`. Note that files in `/lib` are written in ES2015 syntax.

## License

The MIT License (MIT)

Copyright (c) 2016 Kenneth Lim

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
