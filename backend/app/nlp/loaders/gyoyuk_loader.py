# 📌'교육과정' 크롤링 + 문서화

import os
import requests
from langchain_core.documents import Document

def load_gyoyuk_documents() -> list[Document]:
    