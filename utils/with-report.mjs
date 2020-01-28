export function withReport(callback) {
    return (request, response) => {
        const id = `${(new Date).toISOString()}\t${request.method}\t${request.url}`;
        console.log(id);
        console.time(id);

        try {
            callback(request, response)
        } catch (error) {
            console.error(error);
        }

        if (!response.writableFinished) {
            response.statusCode = 500;
            response.end();
        }

        console.timeEnd(id);
    };
}
