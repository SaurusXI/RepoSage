import { OpenAI } from 'langchain/llms/openai';
import { BaseChain, LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { ConsoleCallbackHandler } from 'langchain/callbacks';
import BaseTool from './base.js';
import DiffsKnowledgeRepository from '../knowledge/diffs.js';

export default class TestCasesTool extends BaseTool {
    private static prompt: string = `You are given a git diff in the format specified here: https://git-scm.com/docs/diff-format
    {diff}
    This diff represents changes to a code repository.
    As a release engineer, look at the diff and provide a numbered list of test cases for these changes. If no test cases are required return ''.
    OUTPUT:
    `;

    testCases: string;

    private model: OpenAI;

    private chain: BaseChain;

    private diffRepo: DiffsKnowledgeRepository;

    constructor(diffRepo: DiffsKnowledgeRepository) {
        super();
        this.diffRepo = diffRepo;

        this.model = new OpenAI({
            temperature: 0.2,
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: 'text-davinci-003',
        });

        const prompt = new PromptTemplate({
            inputVariables: ['diff', 'tc'],
            template: TestCasesTool.prompt,
        });

        this.chain = new LLMChain({
            llm: this.model,
            prompt,
            outputKey: 'testCases',
        });
    }

    async call() {
        const { testCases } = await this.chain.call({
            diff: this.diffRepo.getDiffs(),
        }, {
            callbacks: process.env.DEBUG_AI ? [new ConsoleCallbackHandler()] : [],
        });
        this.testCases = testCases;
        return testCases;
    }
}
