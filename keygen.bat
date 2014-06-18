@echo off
set ca=authority
set duration=999
set config=openssl.cfg
set ou="/C=US/L=Idaho/O=Trail Image/CN=trailimage.com"
set policy=policy_anything
set password=whatever
set length=2048

echo Creating Certificate Authority

REM Authority
openssl genrsa -des3 -passout pass:%password% -out %ca%.key %length%
openssl rsa -passin pass:%password% -in %ca%.key -out %ca%.key
openssl req -config %config% -new -x509 -subj %ou% -days %duration% -key %ca%.key -out %ca%.crt
pause

REM Server
echo Creating Server Key
call:createKey server

REM Client
echo Creating Client Key
call:createKey client

del %ca%.key

REM Export the client certificate to pkcs12 for import in the browser
openssl pkcs12 -export -inclient.crt -inkey client.key -certfile %ca%.crt -out client.p12

goto:eof

:createKey
openssl genrsa -des3 -passout pass:%password% -out %1.key %length%
openssl rsa -passin pass:%password% -in %1.key -out %1.key
openssl req -config %config% -new -subj %ou% -key %1.key -out %1.csr
pause
openssl ca -batch -config %config% -days %duration% -in %1.csr -out 1%.crt -keyfile %ca%.key -cert %ca%.crt -policy %policy%
pause
goto:eof