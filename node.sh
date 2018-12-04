#!/usr/bin/env bash

# NVM
export NVM_DIR="$HOME/.nvm"
. "/usr/local/opt/nvm/nvm.sh"

# execute with correct node version
nvm use
nvm run $*
