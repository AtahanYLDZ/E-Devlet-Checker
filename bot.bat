@echo off
set "dosyaAdi=node_modules"
title Perla E-Devlet Bot - Made By AtahanYLDZ
:a
if exist "%dosyaAdi%" (
    color b
    node .\Bot\atahan.js
) else (
    echo Node Modules Bulunamadi! Yukleniyor...
    npm i
    cls
    color b
    node .\Bot\atahan.js
)
goto a