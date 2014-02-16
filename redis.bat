@echo off

for /f "tokens=1,2 delims=@" %%a in ("%REDISCLOUD_URL%") do (
	set protocol=%%a
	set url=%%b
)

for /f "tokens=3 delims=:" %%a in ("%protocol%") do (
	set password=%%a
)

for /f "tokens=1,2 delims=:" %%a in ("%url%") do (
	set url=%%a
	set port=%%b
)

redis-cli -h %url% -p %port% -a %password%