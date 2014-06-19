rem https://langui.sh/2009/01/18/openssl-self-signed-ca/

@echo off
set ca=authority
set duration=999
set config=openssl.cfg
set ou="/C=US/L=Idaho/O=Trail Image/CN=trailimage.com"
set policy=policy_anything
set password=whatever
set length=2048

echo == Creating folders

if not exist .\ssl\root.cer

echo ==
echo == Creating Certificate Authority
echo ==

REM Authority
openssl req -newkey rsa:2048 -days 3650 -x509 -nodes -out .\ssl\%ca%.cer


rem openssl genrsa -des3 -passout pass:%password% -out .\ssl\%ca%.key %length%
rem openssl rsa -passin pass:%password% -in .\ssl\%ca%.key -out .\ssl\%ca%.key
rem openssl req -new -x509 -subj %ou% -days %duration% -key .\ssl\%ca%.key -out .\ssl\%ca%.crt
pause

REM Server
echo ==
echo == Creating Server Key
echo ==
call:createKey server

REM Client
echo ==
echo == Creating Client Key
echo ==
call:createKey client

del .\ssl\%ca%.key

REM Export the client certificate to pkcs12 for import in the browser
openssl pkcs12 -export -in .\ssl\client.crt -inkey .\ssl\client.key -certfile .\ssl\%ca%.crt -out .\ssl\client.p12

goto:eof

:createKey
rem openssl x509 -req -days %duration% -in .\ssl\1%.csr -signkey .\ssl\%1.key -out .\ssl\%1.crt
openssl genrsa -des3 -passout pass:%password% -out .\ssl\%1.key %length%
openssl rsa -passin pass:%password% -in .\ssl\%1.key -out .\ssl\%1.key
openssl req -config %config% -new -subj %ou% -key .\ssl\%1.key -out .\ssl\%1.csr
pause
echo ==
echo == Signing key with authority
echo ==
openssl ca -batch -config %config% -days %duration% -in .\ssl\%1.csr -out .\ssl\1%.crt -keyfile .\ssl\%ca%.key -cert .\ssl\%ca%.crt -policy %policy%
pause
goto:eof