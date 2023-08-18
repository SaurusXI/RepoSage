import { OpenAI } from 'langchain/llms/openai';
import { BaseChain, LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { ConsoleCallbackHandler } from 'langchain/callbacks';
import BaseTool from './base.js';
import DiffsKnowledgeRepository from '../knowledge/diffs.js';

export default class RecommendationTool extends BaseTool {
    private static prompt: string = `You are given a git diff in the format specified here: https://git-scm.com/docs/diff-format
    {diff}
    This diff represents changes that are meant to be merged in a pull request.
    As a QA engineer, provide your recommendation for whether this pull request should be merged with a brief explanation (max 100 words).
    OUTPUT:
    `;

    result: string;

    private model: OpenAI;

    private chain: BaseChain;

    private diffRepo: DiffsKnowledgeRepository;

    constructor(diffRepo: DiffsKnowledgeRepository) {
        super();
        this.diffRepo = diffRepo;

        this.model = new OpenAI({
            temperature: 0.3,
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: 'text-davinci-003',
        });

        const prompt = new PromptTemplate({
            inputVariables: ['diff'],
            template: RecommendationTool.prompt,
        });

        this.chain = new LLMChain({
            llm: this.model,
            prompt,
            outputKey: 'result',
        });
    }

    async call() {
        const { result } = await this.chain.call({
            diff: this.diffRepo.getDiffs(),
        }, {
            callbacks: process.env.DEBUG_AI ? [new ConsoleCallbackHandler()] : [],
        });
        this.result = result;
        return result;
    }
}
