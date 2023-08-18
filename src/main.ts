import axios from 'axios';
import parseGitDiff from 'parse-git-diff';

const getDiffs = async (prUrl: string) => {
    const res = (await axios.get(prUrl, {
        headers: { Accept: 'application/vnd.github.v3.diff' },
    }))['data'];

    const parsedDiff = parseGitDiff(res);
    parsedDiff.files.forEach((fileChange) => {
        console.log(JSON.stringify(fileChange.chunks));
    })
};

getDiffs('https://api.github.com/repos/SaurusXI/sugar-cache/pulls/13');
