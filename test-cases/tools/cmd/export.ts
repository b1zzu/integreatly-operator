import * as fs from "fs";
import { Argv, CommandModule } from "yargs";
import { filterTests, loadTestCases } from "../lib/test-case";
import { loadTestFiles } from "../lib/test-file";
import { flat } from "../lib/utils";

interface CSVArgs {
    output: string;
    filter: string;
}

const jql = (id: string) =>
    `project = Integreatly AND labels  = test-case  AND summary ~ "${id}" ORDER BY createdDate  DESC`;

const runsLink = (id: string) =>
    `https://issues.redhat.com/issues/?jql=${encodeURI(jql(id))}`;

// tslint:disable:object-literal-sort-keys
const csv: CommandModule<{}, CSVArgs> = {
    command: "csv",
    describe: "export all test cases in a csv file",
    builder: {
        output: {
            describe: "the name of the file where to write the csv table",
            type: "string",
            demand: true
        },
        filter: {
            describe: "filter test to create by tags",
            type: "string"
        }
    },
    handler: async args => {
        let tests = flat(loadTestFiles().map(file => loadTestCases(file)));

        if (args.filter !== undefined) {
            tests = filterTests(tests, args.filter.split(","));
        }

        const rows = [
            [
                "ID",
                "Category",
                "Title",
                "Tags",
                "Estimate",
                "Require",
                "Link",
                "Runs"
            ].join(",")
        ];

        const data = tests.map(t =>
            [
                t.id,
                t.category,
                t.title,
                t.tags.join(" "),
                t.estimate,
                t.require.join(" "),
                t.file.link,
                runsLink(t.id)
            ].join(",")
        );

        rows.push(...data);

        fs.writeFileSync(args.output, rows.join("\n"));
    }
};

interface JSONArgs {
    output: string;
}

// tslint:disable:object-literal-sort-keys
const json: CommandModule<{}, JSONArgs> = {
    command: "json",
    describe: "export all test cases in a json file",
    builder: {
        output: {
            describe: "the name of the file where to write the json object",
            type: "string",
            demand: true
        }
    },
    handler: async args => {
        let tests = flat(loadTestFiles().map(file => loadTestCases(file)));

        const data = tests.map(t => ({
            ID: t.id,
            Category: t.category,
            Title: t.title,
            Tags: t.tags,
            Estimate: t.estimate,
            Require: t.require,
            Link: t.file.link,
            Runs: t.id
        }));

        fs.writeFileSync(args.output, JSON.stringify(data));
    }
};

const expor: CommandModule = {
    command: "export",
    describe: "export the test cases in csv",
    builder: (args: Argv): Argv => {
        return args.command(csv).command(json);
    },
    handler: () => {
        // nothing
    }
};

export { expor };
