export function flat<T>(array: T[][]): T[] {
    let result = [];
    array.forEach(item => {
        result = result.concat(item);
    });
    return result;
}

export function extractId(title: string): { id: string; title: string } {
    // A01 - Title
    const match = /^(?<id>[A-Z][0-9]{2})\s-\s(?<title>.*)$/.exec(title);
    if (match) {
        return {
            id: match.groups.id,
            title: match.groups.title
        };
    } else {
        throw new Error(`can not extract the ID from '${title}'`);
    }
}
