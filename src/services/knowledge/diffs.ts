import axios from 'axios';
// import parseGitDiff, { AnyFileChange } from 'parse-git-diff';
import BaseKnowledgeRepository from './base.js';

export default class DiffsKnowledgeRepository extends BaseKnowledgeRepository {
    // private fileChanges: AnyFileChange[];

    private rawDiff: string;

    async init(prURL: string) {
        this.rawDiff = (await axios.get(prURL, {
            headers: { Accept: 'application/vnd.github.v3.diff' },
        })).data;

        // const parsedDiff = parseGitDiff(this.rawDiff);
        // this.fileChanges = parsedDiff.files;
    }

    getDiffs() {
        return this.rawDiff;
    }

    setDiffs(rawDiff : string) {
        this.rawDiff = rawDiff;
    }
}
