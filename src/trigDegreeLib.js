/**
* @Author: Lim Mingjie, Kenneth <Astrianna>
* @Date:   2016-06-16T18:29:15-04:00
* @Email:  me@kenlimmj.com
* @Last modified time: 2016-06-19T01:58:50-04:00
* @License: MIT
* @flow
*/

// Radian <-> Degree conversions
export const _radToDeg = (x: number): number => x * 180 / Math.PI;
export const _degToRad = (x: number): number => x * Math.PI / 180;

// Decorate native trigonometric functions
export const cosd = (x: number): number => Math.cos(_degToRad(x));
export const sind = (x: number): number => Math.sin(_degToRad(x));
export const atan2d = (x: number, y: number): number => _radToDeg(Math.atan2(x, y));
