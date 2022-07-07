class TwitchPubSubRewards {
    constructor(channel, token) {
      this.topic = `channel-points-channel-v1.${channel}`;
      this.token = token;
    };
  
    connect() {
      return new Promise((res,rej) => {
        setTimeout(_=> {
          this.connection = new WebSocket('wss://pubsub-edge.twitch.tv');
          this.connection.onopen = this.onOpen.bind(this);
          this.connection.onmessage = this.onRedeem.bind(this);
          this.connection.onclose = this.onClose.bind(this);
          res();
        }, 7500);
      })
    };
  
    onOpen() {
      console.log('PubSub Opened');
      this.ping();
      this.listen();
      this.heartbeat = setInterval(this.ping.bind(this), 1000 * 120);
    };
  
    listen() {
      console.log('listen');
      console.log(this.token);
      this.connection.send(
        JSON.stringify({
          type: 'LISTEN',
          data: {
            topics: [this.topic],
            auth_token: this.token
          }
        }));
    };
  
    onClose() {
      console.log('PubSub Closed ', Date.now());
      clearInterval(this.heartbeat);
    };
  
    ping() {
      console.log('PubSub Ping ', Date.now());
      this.connection.send(JSON.stringify({
        type: 'PING'
      }));
    };
  
    reconnect() {
      console.log('PubSub connection closed By Twitch ', Date.now());
      this.connection.close();
      //handle force reconnect... tbd
    };
  
    onRedeem({ data: psObject }) {
      psObject = JSON.parse(psObject);
      console.log(psObject);
      if (psObject.type === 'RESPONSE') return;
      else if (psObject.type === 'PONG') return;
      else if (psObject.type === 'RECONNECT') return this.reconnect();
      else if (psObject.type === 'MESSAGE' && psObject.data.topic === this.topic) {
        let message = JSON.parse(psObject.data.message);
        if (message.type === 'reward-redeemed') return this.emitPuSub(message);
      };
    };
  
    emitPuSub(message) {
      console.log(message);
      console.log(message.data.redemption);
      console.log(message.data.redemption.reward);
      const channelPointEvent = new CustomEvent("onEventReceived", {
        detail: {
          "listener": "reward-redeemed",
          "event": {
            "service": "twitch",
            "data": {
              "time": new Date(message.data.timestamp).getTime(),
              "tags": message,
              "nick": message.data.redemption.user.login,
              "userId": message.data.redemption.user.id,
              "displayName": message.data.redemption.user.display_name,
              "text": message.data.redemption.user_input,
              "rewardId": message.data.redemption.reward.id,
              "rewardTitle": message.data.redemption.reward.title,
              "id": message.data.redemption.id,
            },
          },
        }
      });
      window.dispatchEvent(channelPointEvent);
    };
  };
  