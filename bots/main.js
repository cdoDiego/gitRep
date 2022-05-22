let user = 'cdodiego';
const urlChatters = `http://tmi.twitch.tv/group/user/`;
const urlChatters2 = '/chatters'
const urlBots = 'http://api.twitchinsights.net/v1/bots/all';

async function getBots() {
    console.log(user);
    let chat = await callURL(urlChatters + user + urlChatters2);
    let bots = await callURL(urlBots);
    let chatList = getChatList(chat);
    let botList = getBotsList(bots);
    let botsInChat = getArraysIntersection(chatList, botList);
    $('#resultado').html(`${user} tiene ${botsInChat.length} bots en el chat`);
    let htmlList = '<ul class="list-group">';
    for(let i = 0; i<botsInChat.length; i++) {
        htmlList+= `<li class="list-group-item">${botsInChat[i]}</li>`;
    }
    htmlList+= '</ul>';
    $('#List').show();
    $('#bots').html(htmlList);
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

function getArraysIntersection(a1,a2){
    return  a1.filter(function(n) { return a2.indexOf(n) !== -1;});
}

function getBotsList(bots) {
    let botlist = [];
    for(let i = 0; i< bots.bots.length; i++) {
        botlist.push(bots.bots[i][0]);
    }
    return botlist;
}

async function callURL(url) {
    let urlEncode = encodeURIComponent(url);
    let call = await fetch(`https://api.allorigins.win/get?url=${urlEncode}`)
      .then(response => response.json())
      .then(json => json);
    return JSON.parse(call.contents);
}

$( document ).ready(function() {
    $('#List').hide();
    $('#resultado').html('');
});

$( "#buscar" ).click(function() {
    user = $('#usr').val();
    user = user.toLowerCase();
    getBots();
});