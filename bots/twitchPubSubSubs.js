class TwitchPubSubRewards {
    constructor(channel, token) {
      this.topic = `channel-subscribe-events-v1.${channel}`;
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
        console.log(message);
        return this.emitSubscription(message);
        //if (message.type === 'reward-redeemed') return this.emitPuSub(message);
      };
    };
  
    emitSubscription(message) {
      const channelPointEvent = new CustomEvent("onEventReceived", {
        detail: {
          "listener": "sub-noti",
          "event": {
            "service": "twitch",
            "data": {
              "time": new Date(message.time).getTime(),
              "username": message.user_name,
              "username-sub": message.is_gift ? message.recipient_user_name : message.user_name,
              "tags": message,
              "sub_plan": message.sub_plan,
              "extra": message,
              "sub_plan": message.sub_plan,
              "sub_plan_name": message.sub_plan_name,
              "months": message.months,
              "cumulative_months": message.cumulative_months,
              "context": message.context,
              "is_git": message.is_gift,
              "multi_month_duration": message.multi_month_duration
            }
          }
        }
      });
      window.dispatchEvent(channelPointEvent);
    }

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
  