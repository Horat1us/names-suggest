export function toCamelCase(str) {
    return str.replace(
        /(?:^\w|[A-Z]|\b\w|-|\s+)/g,
        (match) => (/[\s\-]+/.test(match)) ? " " : match.toUpperCase()
    );
}
