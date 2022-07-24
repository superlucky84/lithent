import { TagFunction, FragmentFunction } from '@/types';

export function checkFunction(target: unknown): target is Function {
  return typeof target === 'function';
}

export function checkCustemComponent(target: unknown): target is TagFunction {
  return typeof target === 'function' && target.name !== 'Fragment';
}

export function checkFragment(target: unknown): target is FragmentFunction {
  return typeof target === 'function' && target.name === 'Fragment';
}
