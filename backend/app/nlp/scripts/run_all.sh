#!/bin/bash

set -a
source backend/.env
set +a

echo 'embed_haksa.py 실행 중...'
python -m app.nlp.embedding.embed_haksa

echo '모든 임베딩 완료!'
