#!/usr/bin/env nodemon --experimental-modules --es-module-specifier-resolution=node
import http from "http";
import { withReport } from "./utils/with-report";
import { formatResponse } from "./utils/format-response";
import { loadData } from "./utils/load-data";

const port = 1488;
const data = loadData();
const tags = Array.from(data.reduce((set, { tags }) => tags.forEach((tag) => set.add(tag)) || set, new Set));

const server = http.createServer(withReport(formatResponse(
    (request, response) => {
        const url = new URL('http://' + request.headers.host + request.url);
        const view = { tags, };
        let providers = data;

        if (url.pathname !== '/') {
            const route = url.pathname.substring(1).toLowerCase().split('/');
            if (route.some((tag) => !tags.includes(tag))) {
                return [404, { message: "Invalid Tags" }];
            }
            providers = providers.filter(({ tags }) => route.every(
                (routeTag) => tags.includes(routeTag))
            );
            view.route = route;
        }
        view.items = Array.from(providers.reduce((set, { data }) => {
            data.forEach(set.add, set);
            return set;
        }, new Set));

        if (url.searchParams.has('q')) {
            console.log(url.searchParams.get('q'));
            const query = decodeURIComponent(url.searchParams.get('q'))
                .toLowerCase()
                .trim()
                .replace(/[^А-Яа-яёЁЇїІіЄєҐґa-zA-Z00-9]/ug, '');
            view.items = view.items.filter((item) => item.startsWith(query));
            view.query = query;
        }

        view.size = JSON.stringify(view.items).length / 1000;
        view.total = view.items.length;
        view.items = view.items.slice(0, 100);

        return [200, view];
    }
)));

server.listen(port, () => {
    console.log(`listening on ${port}`);
});
//trnsl.1.1.20200117T173152Z.3a12cf37feff0787.a6b3c1b7ae8a55b1fcc26800d11de2baba889113
