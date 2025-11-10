#!/bin/bash
cd /home/kavia/workspace/code-generation/expense-splitter-for-small-shops-40774-40783/expense_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

