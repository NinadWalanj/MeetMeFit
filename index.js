const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const dotenv=require('dotenv');

const app = express();
dotenv.config({path:"./.env"});

const nocache = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

const generateAccessToken = (req, res) => {
  // set response header
  res.header('Acess-Control-Allow-Origin', '*');
  // get channel name
  const channelName = req.query.channelName;
  if (!channelName) {
    return res.status(500).json({ 'error': 'channel is required' });
  }
  // get uid 
  let uid = req.query.uid;
  if (!uid || uid == '') {
    uid = 0;
  }
  // get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == 'publisher') {
    role = RtcRole.PUBLISHER;
  }
  // get the expire time
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime == '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const token = RtcTokenBuilder.buildTokenWithUid(process.env.APP_ID, process.env.APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  console.log(token);
  // return the token
  return res.json({ 'token': token });
}

app.get('/access_token', nocache, generateAccessToken);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port: ${process.env.PORT || 3000}`);
});