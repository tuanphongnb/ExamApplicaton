@echo off
timeout 1
cd /d public
CALL npm install
cd /d ../server
CALL npm install
CALL npm install pm2@latest -g
CALL pm2-startup install
CALL pm2 start controller/server.js
CALL pm2 save
pause