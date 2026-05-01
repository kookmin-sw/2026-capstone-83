import { setupWorker } from 'msw/browser';
import { jobPostHandlers } from './handlers/jopPost.handler';


const handlers = [
  ...jobPostHandlers,
]

export const worker = setupWorker(...handlers);