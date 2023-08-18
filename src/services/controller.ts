import DiffsKnowledgeRepository from './knowledge/diffs.js';
import ChangelogTool from './tools/changelog.js';
import IncidentTool from './tools/incident.js';
import SummaryTool from './tools/summary.js';
import TestCasesTool from './tools/tc.js';

export default class ControllerAgent {
    private diffsRepo: DiffsKnowledgeRepository;

    private testCasesTool: TestCasesTool;

    private summaryTool: SummaryTool;

    private changelogTool: ChangelogTool;

    private incidentTool: IncidentTool;

    constructor() {
        this.diffsRepo = new DiffsKnowledgeRepository();
        this.testCasesTool = new TestCasesTool(this.diffsRepo);
        this.summaryTool = new SummaryTool(this.diffsRepo);
        this.changelogTool = new ChangelogTool(this.diffsRepo);
        this.incidentTool = new IncidentTool(this.diffsRepo);
    }

    async processPR(prURL: string) {
        await this.diffsRepo.init(prURL);

        await Promise.all([
            this.summaryTool.call().then(console.log),
            this.testCasesTool.call().then(console.log),
            this.changelogTool.call().then(console.log),
            this.incidentTool.call('Library response time crossed 500ms threshold').then(console.log),
        ]);
    }
}
