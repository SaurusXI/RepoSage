import dotenv from 'dotenv';
import ControllerAgent from './services/controller.js';

dotenv.config();

const controller = new ControllerAgent();
controller.processPRFromUrl('https://api.github.com/repos/SaurusXI/sugar-cache/pulls/13');

export { controller };
