export async function compute(params, ctx) {
    const url = new URL(
        'https://api.openai.com/v1/files'
    );
    const headers = {};
    const addQueryParam = (key, val) => { if (val != null) { url.searchParams.append(key, val); } };
    if (params['auth'] != null) {
        headers['Authorization'] = ('Bearer' + ' ' + params['auth'].replace(/^Bearer\s*/gi, ''));
    }
    if (params['betaAccess'] != null) {
        headers['OpenAI-Beta'] = params['betaAccess'];
    }
    const formData = new FormData();
    const addFormDataParam = (key, val, filename) => {
        if (val === undefined) { return; }
        if (filename === undefined) {
            formData.append(key, val);
        } else {
            formData.append(key, val, filename);
        }
    };
    addFormDataParam('file', params['file'], params['filename']);
    addFormDataParam('purpose', params['purpose']);
    return formData;
}
