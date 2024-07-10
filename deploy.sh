#!/bin/bash
npm run build
zip -r -q -X theologian_chat.zip server-build
scp -i $EC2_PEM_PATH theologian_chat.zip ubuntu@$EC2_PUBLIC_IP:/home/ubuntu/.temp/
ssh -i $EC2_PEM_PATH ubuntu@$EC2_PUBLIC_IP << EOF
  mv ./.temp/theologian_chat.zip . || { echo "Failed to move the file"; exit 1; }
  rm -rf theologian_chat || { echo "Failed to remove old files"; exit 1; }
  unzip -q theologian_chat.zip -d theologian_chat || { echo "Failed to unzip new files"; exit 1; }
  rm theologian_chat.zip 
  sudo systemctl restart theologian_chat || { echo "Failed to restart service"; exit 1; }
EOF
rm theologian_chat.zip
echo "Script completed successfully."
