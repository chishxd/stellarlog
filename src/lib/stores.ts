import { writable } from 'svelte/store';
import type { GithubCommit } from './types';

export const commitStore = writable<GithubCommit[]>([]);
