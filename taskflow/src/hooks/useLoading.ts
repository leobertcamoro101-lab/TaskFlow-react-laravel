// useLoading.ts
import { useContext } from 'react';
import { LoadingContext } from '../context/loading-context';

export function useLoading() {
  return useContext(LoadingContext);
}