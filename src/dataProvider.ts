import { dataProvider } from 'refine-pocketbase';
import { pb } from './lib/pocketbase';

export const walyDataProvider = dataProvider(pb);
