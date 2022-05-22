let user = 'cdodiego';
const urlChatters = `http://tmi.twitch.tv/group/user/${user}/chatters`;
const urlBots = 'http://api.twitchinsights.net/v1/bots/all';

async function getBots() {
    let chat = await callURL(urlChatters);
    let bots = await callURL(urlBots);
    console.log(chat);
    console.log(bots);
    getChatList(chat);
    getBotsList(bots);
}

function getChatList(chat) {
    let userschat = [];
    userschat = userschat.concat(chat.chatters.admins);
    userschat = userschat.concat(chat.chatters.broadcaster);
    userschat = userschat.concat(chat.chatters.global_mods);
    userschat = userschat.concat(chat.chatters.moderators);
    userschat = userschat.concat(chat.chatters.staff);
    userschat = userschat.concat(chat.chatters.vips);
    userschat = userschat.concat(chat.chatters.viewers);
    return userschat;
}

function getBotsList(bots) {
    let botlist = [];
    for(let i = 0; i< bots.bots.length; i++) {
        botlist.push(bots.bots[i][0]);
    }
}

async function callURL(url) {
    let urlEncode = encodeURIComponent(url);
    let call = await fetch(`https://api.allorigins.win/get?url=${urlEncode}`)
      .then(response => response.json())
      .then(json => json);
    return JSON.parse(call.contents);
}

console.log('holi');
getBots();
