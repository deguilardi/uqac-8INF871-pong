#!/usr/bin/env bash
CUR_DIR=$( cd "$( dirname "$0" )" && pwd )
"${CUR_DIR}/node_modules/.bin/http-server" "${CUR_DIR}" -c-1