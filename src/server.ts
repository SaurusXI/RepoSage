import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import ControllerAgent from './services/controller.js';
import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';

export class Server {
    private app: Application;
    private controller: ControllerAgent;
    private octokit: Octokit;

    constructor() {
        this.app = express();
        this.config();
        this.routes();

        this.controller = new ControllerAgent();

        this.octokit = new Octokit({
            auth: process.env.GITHUB_PAT, // Ensure you have a GitHub token
        });
    }

    private config(): void {
        this.app.use(bodyParser.json());
    }

    private async removeExistingComments(prUrl: string) {
        const owner = prUrl.split('/')[4];
        const repo = prUrl.split('/')[5];
        const issue_number = parseInt(prUrl.split('/').pop() || '', 10);

        const comments = await this.octokit.issues.listComments({
            owner: owner,
            repo: repo,
            issue_number: issue_number,
        });

        const botComments = comments.data.filter(comment => comment.user.login === 'RepoSage');
        
        for (const botComment of botComments) {
            await this.octokit.issues.deleteComment({
                owner: owner,
                repo: repo,
                comment_id: botComment.id,
            });
        }
    }

    private async postCommentToPR(prUrl: string, results: {
        summary: string;
        testCases: string;
        changelog: string;
        recommendation: string;
    }): Promise<void> {
        await this.removeExistingComments(prUrl);

        const { summary, testCases, changelog, recommendation } = results;
        const comment = `## Summary\n${summary}\n\n## Test Cases Recommendations\n${testCases}\n\n \
                    \n## Changelog\n${changelog}\n\n## Recommendation\n${recommendation}`;

        console.log("Posting comment to PR: ", prUrl, " with comment: ", comment);

        const issue_number = parseInt(prUrl.split('/').pop() || '', 10);

        await this.octokit.issues.createComment({
            issue_number: issue_number,
            owner: prUrl.split('/')[4],
            repo: prUrl.split('/')[5],
            body: comment,
        });
    }

    private routes(): void {
        this.app.post('/webhook', async (req: Request, res: Response) => {
            // Extracted PR URL
            const prUrl = req.body?.pull_request?.url;

            if (!prUrl) {
                console.log("invalid pr data received ", req.body);
                return res.status(400).json({
                    message: 'Invalid PR data received.',
                });
            }

            const results = await this.controller.processPRFromUrl(prUrl);

            console.log("Processed PR from URL: ", prUrl, " with results: ", results);

            // Posting suggestions to PR as comments
            await this.postCommentToPR(prUrl, results);

            // TODO: Post additional responses to PR as required
            return res.status(200).json({
                message: 'Processed PR successfully',
            });
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
