#!/bin/bash
npm run build
zip -r -X theologian_chat.zip server-build
scp -i /Users/jacksonstone/Desktop/Jackson\ Personal\ Site\ Key.pem theologian_chat.zip ubuntu@3.19.146.227:/home/ubuntu/.temp/
ssh -i /Users/jacksonstone/Desktop/Jackson\ Personal\ Site\ Key.pem ubuntu@3.19.146.227 << EOF
  mv ./.temp/theologian_chat.zip . || { echo "Failed to move the file"; exit 1; }
  rm -rf theologian_chat
  unzip theologian_chat.zip -d theologian_chat
  rm theologian_chat.zip
  sudo systemctl restart theologian_chat
EOF
rm theologian_chat.zip