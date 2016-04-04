#!/bin/bash

apidoc -i server/app/controllers -o document/server
chmod 755 document/server/index.html

yuidoc .
