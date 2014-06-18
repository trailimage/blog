openssl genrsa -out trailimage-key.pem 1024
openssl req -new -key trailimage-key.pem -out certrequest.csr
openssl x509 -req -in certrequest.csr -signkey trailimage-key.pem -out trailimage-cert.pem

REM server
openssl req -newkey rsa:2048 -days 3650 -x509 -nodes -out root.cer
openssl req -newkey rsa:1024 -nodes -out server.csr -keyout server.key
openssl ca -batch -config c:\\dev\\OpenSSL\\share\\trailimage.cnf -notext -in server.csr -out server.cer

REM client
openssl req -newkey rsa:1024 -nodes -out client.csr -keyout client.key
openssl ca -batch -config c:\\dev\\OpenSSL\\share\\trailimage.cnf -notext -in client.csr -out client.cer
openssl pkcs12 -export -passout pass:qwerty -in client.cer -inkey client.key -certfile root.cer -out client.p12


REM Authority key
openssl genrsa -des3 -passout pass:qwerty -out authority.key 2048
openssl rsa -passin pass:qwerty -in authority.key -out authority.key
openssl req -config openssl.cnf -new -x509 -subj '/C=US/L=Idaho/O=Trail Image CA/CN=trailimage.com' -days 999 -key authority.key -out authority.crt

REM Server key
openssl genrsa -des3 -passout pass:qwerty -out server.key 2048
openssl rsa -passin pass:qwerty -in server.key -out server.key
openssl req -config openssl.cnf -new -subj '/C=US/L=Idaho/O=Trail Image/CN=trailimage.com' -key server.key -out server.csr
openssl ca -batch -config openssl.cnf -days 999 -in server.csr -out server.crt -keyfile authority.key -cert authority.crt -policy policy_anything

REM Private key
openssl genrsa -des3 -passout pass:qwerty -out client.key 2048
openssl rsa -passin pass:qwerty -in client.key -out client.key
openssl req -config openssl.cnf -new -subj '/C=US/L=Idaho/O=Trail Image/CN=trailimage.com' -key client.key -out client.csr
openssl ca -batch -config openssl.cnf -days 999 -in client.csr -out client.crt -keyfile authority.key -cert authority.crt -policy policy_anything

REM Export the client certificate to pkcs12 for import in the browser
openssl pkcs12 -export -passout pass:qwerty -in client.crt -inkey client.key -certfile root.cer -out client.p12
