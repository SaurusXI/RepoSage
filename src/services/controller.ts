import DiffsKnowledgeRepository from './knowledge/diffs.js';
import ChangelogTool from './tools/changelog.js';
import IncidentTool from './tools/incident.js';
import RecommendationTool from './tools/recommendation.js';
import SummaryTool from './tools/summary.js';
import TestCasesTool from './tools/tc.js';

export default class ControllerAgent {
    private diffsRepo: DiffsKnowledgeRepository;

    private testCasesTool: TestCasesTool;

    private summaryTool: SummaryTool;

    private changelogTool: ChangelogTool;

    private incidentTool: IncidentTool;

    private recommendationTool: RecommendationTool;

    constructor() {
        this.diffsRepo = new DiffsKnowledgeRepository();
        this.testCasesTool = new TestCasesTool(this.diffsRepo);
        this.summaryTool = new SummaryTool(this.diffsRepo);
        this.changelogTool = new ChangelogTool(this.diffsRepo);
        this.incidentTool = new IncidentTool(this.diffsRepo);
        this.recommendationTool = new RecommendationTool(this.diffsRepo);
    }

    getSummary() {
        return this.summaryTool.result;
    }

    getTCs() {
        return this.testCasesTool.testCases;
    }

    getChangelog() {
        return this.changelogTool.result;
    }

    getRecommendation() {
        return this.recommendationTool.result;
    }

    async processPR(prURL: string) {
        await this.diffsRepo.init(prURL);

        const results = await Promise.all([
            this.summaryTool.call(),
            this.testCasesTool.call(),
            this.changelogTool.call(),
            // this.incidentTool.call('Library response time crossed 500ms threshold'),
            this.recommendationTool.call(),
        ]);

        return {
            summary: results[0],
            testCases: results[1],
            changelog: results[2],
            recommendation: results[3],
        };
    }
}
