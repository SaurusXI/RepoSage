import dotenv from 'dotenv';
import ControllerAgent from './services/controller.js';

dotenv.config();

const controller = new ControllerAgent();

try {
    controller.processPRFromUrl('https://api.github.com/repos/SaurusXI/sugar-cache/pulls/13').then((results) => {
        console.log("Results", results);
    });
} catch (e) {
    console.log("Error", e);
}

export { controller };
