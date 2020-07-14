import * as fs from "fs";
import * as matter from "gray-matter";
import * as path from "path";

const TEST_DIR = "./tests";
const TEST_FILTER = /^.*\.md$/;
const REPO_URL =
    "https://github.com/integr8ly/integreatly-operator/tree/master/test-cases";

interface Metadata {
    tags: string[];
    estimate: string;
    require: string[];
}

type Variant = Metadata & {
    vars: { [key: string]: any };
};

type TestCaseMetadata = Metadata & {
    variants?: Variant[];
};

/**
 * Represent exactly one .md test file
 */
interface TestFile {
    data: TestCaseMetadata;
    content: string;
    file: string;
    link: string;
}

/**
 * Recursive search for all files in dir that matches the filter.
 */
function walk(dir: string, filter: RegExp): string[] {
    const results: string[] = [];

    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);

        const stats = fs.statSync(full);

        if (stats.isDirectory()) {
            results.push(...walk(full, filter));
        } else if (filter.test(file)) {
            results.push(full);
        }
    }

    return results;
}

function loadTestFiles(testDirectory?: string): TestFile[] {
    return walk(testDirectory || TEST_DIR, TEST_FILTER).map(file => {
        const m = matter.read(file);

        return {
            content: m.content,
            data: m.data as TestCaseMetadata,
            file,
            link: `${REPO_URL}/${file}`
        };
    });
}

function desiredFileName(title: string): string {
    let name = title;

    name = name.toLowerCase();
    name = name.replace(/[^a-z0-9\s]/g, "");
    name = name.replace(/\s+/g, "-");
    name = name.substr(0, 64);
    name = name.replace(/-$/, "");

    return `${name}.md`;
}

export { loadTestFiles, desiredFileName, TestFile, Metadata };
