async function salvarToken(token) {
    await SE_API.store.get('tokenAPI').then(async obj => {
        if (obj == null) {
            SE_API.store.set('tokenAPI', token);
        } else {
            token = obj.value;
        }
        let res = await fetch('https://id.twitch.tv/oauth2/validate', {
            method: 'GET', // or 'PUT'
            headers: {
                'Authorization': 'OAuth ' + token
            }
        }).then(res => res.json());
        console.log(res);
        if (res.status == 401) {
            await SE_API.store.get('refreshAPI').then(async objR => {
                if (objR != null) {
                    refresh = objR.value;
                }
                let res = await
                    fetch('https://twitch-token-generate.herokuapp.com/refresh/' + refresh)
                        .then(response => response.json());
                token = res.access_token;
                refresh = res.refresh_token;
                SE_API.store.set('tokenAPI', token);
                SE_API.store.set('refreshAPI', refresh);
            });
        }
    })
    .catch(err => {
        console.log('error');
        console.log(err)
    });
    return token;
}