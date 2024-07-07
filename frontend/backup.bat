@echo off
set current_time=%date% %time:~0,8%
git add .
git commit -m "backing up to online. timestamp: %current_time%"
git push origin testing:backup-adil
echo Git commands have been executed.
pause
