import { deleteAsync } from 'del';

export async function clean() {
  return deleteAsync(['build'])
}
