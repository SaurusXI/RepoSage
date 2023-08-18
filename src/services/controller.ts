import DiffsKnowledgeRepository from './knowledge/diffs.js';
import TestCasesTool from './tools/tc.js';

export default class ControllerAgent {
    private diffsRepo: DiffsKnowledgeRepository;

    private testCasesTool: TestCasesTool;

    constructor() {
        this.diffsRepo = new DiffsKnowledgeRepository();
        this.testCasesTool = new TestCasesTool(this.diffsRepo);
    }

    async processPR(prURL: string) {
        await this.diffsRepo.init(prURL);

        await this.testCasesTool.call();
        console.log(this.testCasesTool.testCases);
    }
}
