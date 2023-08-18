import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import ControllerAgent from './services/controller.js';
import dotenv from 'dotenv';

export class Server {
  private app: Application;
  private controller: ControllerAgent;

  constructor() {
    this.app = express();
    this.controller = new ControllerAgent();
    this.config();
    this.routes();
  }

  private config(): void {
    this.app.use(bodyParser.json());
  }

  private routes(): void {
    this.app.post('/webhook', async (req: Request, res: Response) => {
        // This is the webhook endpoint for GitHub, triggered when a PR is opened
        // or updated. The body of the request contains the PR data.
        console.log('Webhook triggered', req.body);
        const { pull_request: pr } = req.body || {};
        if (!pr) {
            return res.status(400).json({
                message: 'Request body needs to be like { pull_request: { url: "..." } }',
            });
        }
        const out = await this.controller.processPRFromUrl(pr.url);
        console.log('Webhook processed', out);
        return res.status(200).json(out);
    });

    this.app.post('/process', async (req: Request, res: Response) => {
      const { url } = req.body || {};
      if (!url) {
        return res.status(400).json({
          message: 'Request body needs to be like { url: "..." }',
        });
      }
      const out = await this.controller.processPRFromUrl(url);
      return res.status(200).json(out);
    });

    this.app.get('/recommendation', async (_: Request, res: Response) => {
      const out = this.controller.getRecommendation();
      return res.json(out);
    });

    this.app.get('/changelog', async (_: Request, res: Response) => {
      const out = this.controller.getChangelog();
      return res.json(out);
    });

    this.app.get('/description', async (_: Request, res: Response) => {
      const out = this.controller.getSummary();
      return res.json(out);
    });

    this.app.get('/test-cases', async (_: Request, res: Response) => {
      const out = this.controller.getTCs();
      return res.json(out);
    });
  }

  public start(): void {
    this.app.listen(15672, () => {
      console.log('Server listening on port 15672');
    });
  }
}

dotenv.config();
const server = new Server();
server.start();
