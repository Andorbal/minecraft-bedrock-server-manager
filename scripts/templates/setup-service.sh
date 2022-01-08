#!/bin/bash
set -e

if [[ $1 == "enable" ]]; then
  cp dirname/minecraftbe/servername/minecraftbe.service /etc/systemd/system/minecraft.servername.service
  systemctl daemon-reload
  systemctl enable minecraft.servername.service
  systemctl daemon-reload
  systemctl start minecraft.servername.service
elif [[ $1 == "disable" ]]; then
  systemctl stop minecraft.servername.service
  systemctl disable minecraft.servername.service
  systemctl daemon-reload
  rm /etc/systemd/system/minecraft.servername.service
else
  echo "Error: Unknown command $1"
fi


  # if [[ $START_AUTOMATICALLY == "TRUE" ]]; then
  #   sudo systemctl enable $ServerName.service
  #   # Automatic reboot at 4am configuration
  #   if [[ $RESTART_AT_FOURAM == "TRUE" ]]; then
  #     croncmd="$DirName/minecraftbe/$ServerName/restart.sh 2>&1"
  #     cronjob="0 4 * * * $croncmd"
  #     ( crontab -l | grep -v -F "$croncmd" ; echo "$cronjob" ) | crontab -
  #     echo "Daily restart scheduled.  To change time or remove automatic restart type crontab -e"