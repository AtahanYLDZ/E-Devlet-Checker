@echo off
set "dosyaAdi=node_modules"
title Perla E-Devlet Checker - Made By AtahanYLDZ
:a
if exist "%dosyaAdi%" (
    color b
    node --max-old-space-size=4096 .\Checker\atahan.js
) else (
    echo Node Modules Bulunamadi! Yukleniyor...
    npm i
    cls
    color b
    node --max-old-space-size=4096 .\Checker\atahan.js
)
goto a