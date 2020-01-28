import https from "https";

export function yandexTranslate(text) {
    const url = new URL('https://translate.yandex.net/api/v1.5/tr.json/translate');
    return new Promise((resolve, reject) => {
        console.log(`GET api.translate.yandex ${text.length}`);
        const request = https.request(url, {
            method: 'post',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 500,
        }, (response) => {
            let output = '';
            response.setEncoding('utf8');
            response.on('data', chunk => output += chunk);
            response.on('end', () => {

                const body = JSON.parse(output);
                if (body.code !== 200) {
                    return reject(body.message || output);
                }

                resolve(JSON.parse(output).text[0]);
            });
        });
        request.on('error', (error) => {
            console.error(error);
            reject(error)
        });

        const searchParams = new URLSearchParams();

        searchParams.append('key', process.env.YANDEX_TRANSLATE_KEY);
        searchParams.append('text', text);
        searchParams.append('lang', 'ru-uk');
        searchParams.append('format', 'plain');

        request.end(searchParams.toString());
    })
}
