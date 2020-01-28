import { toCamelCase } from "./to-camel-case";

export function formatResponse(callback) {
    return (request, response) => {
        const [status, body = {}] = callback(request, response) || [200];

        if (!request.headers.accept.includes('text/html')
            || !(('items' in body) || ('children' in body) || ('message' in body))
        ) {
            return response
                .writeHead(status, { 'Content-Type': 'application/json; charset=UTF-8' })
                .end(JSON.stringify(body));
        }

        response.writeHead(status, { 'Content-Type': 'text/html; charset=UTF-8' });
        if (status >= 400 && body.message) {
            response.write(
                `<div><h1>${response.statusCode} - <small>Server Error</small></h1><p>${body.message}</p></div>`
            );
        }
        response.write(`<h1><a href="//${request.headers.host}/">VaryDB</a></h1>`);
        if (body.tags && Array.isArray(body.tags) && body.tags.length) {
            const tags = body.tags.map(
                (tag) => `<a href="/${tag}"><button type="button">${toCamelCase(tag)}</button></a>`
            );
            response.write(`<hr><nav>${tags}</nav>`);
        }
        if (body.children) {
            response.write('<hr><h2>Children</h2><ul>');
            body.children
                .map(({href, title, count}) => `<li><a href="${href}">${title} <small>(${count})</small></a></li>`)
                .forEach((element) => response.write(element));
            response.write('</ul>');
        }
        if (body.items) {
            const items = body.items.map((item) => `<li>${item}</li>`).join('');
            const form = `<form method="get"><label for="search">Search</label><input value="${body.query}" type="text" name="q"></form>`
            response.write(`<hr><h2>Items</h2><h3>Total: ${body.total} ${body.size}KB</h3>${form}<ul>${items}</ul>`);
        }
        return response.end(`<hr><pre>${JSON.stringify(body, undefined, 2)}</pre>`);
    };
}
