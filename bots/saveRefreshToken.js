async function salvarToken(token, name, rfName) {
    await SE_API.store.get(name).then(async obj => {
        if (obj == null) {
            SE_API.store.set(name, token);
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
            await SE_API.store.get(rfName).then(async objR => {
                if (objR != null) {
                    refresh = objR.value;
                }
                let res = await
                    fetch('https://twitch-token-generate.herokuapp.com/refresh/' + refresh)
                        .then(response => response.json());
                token = res.access_token;
                refresh = res.refresh_token;
                SE_API.store.set(name, token);
                SE_API.store.set(rfName, refresh);
            });
        }
    })
    .catch(err => {
        console.log('error');
        console.log(err)
    });
    return token;
}