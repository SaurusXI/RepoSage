import { OpenAI } from 'langchain/llms/openai';
import { BaseChain, LLMChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { ConsoleCallbackHandler } from 'langchain/callbacks';
import BaseTool from './base.js';
import DiffsKnowledgeRepository from '../knowledge/diffs.js';

export default class IncidentTool extends BaseTool {
    private static prompt: string = `You are given a git diff in the format specified here: https://git-scm.com/docs/diff-format
    {diff}
    This diff represents changes to a code repository.
    You are given details of a production incident that may or may not be related to these code changes.
    {description}
    If there is any possibility that the production incident was caused by these changes, explain.
    If not, return '' 
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
            temperature: 0.2,
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: 'gpt-3.5-turbo',
        });

        const prompt = new PromptTemplate({
            inputVariables: ['diff', 'description'],
            template: IncidentTool.prompt,
        });

        this.chain = new LLMChain({
            llm: this.model,
            prompt,
            outputKey: 'result',
        });
    }

    async call(description: string) {
        const { result } = await this.chain.call({
            diff: this.diffRepo.getDiffs(),
            description,
        }, {
            callbacks: process.env.DEBUG_AI ? [new ConsoleCallbackHandler()] : [],
        });
        this.result = result;
        return result;
    }
}
