import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

EMBED_DIR = os.path.join(BASE_DIR, "embedding")#⭐ embed_파일들.py이 들어 있는 폴더 경로
SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "run_all.sh")#⭐ 만들어질 bash 스크립트 저장 경로(run_all.py이 만들어질 예정)

def main():
    files = os.listdir(EMBED_DIR)
    embed_files = [f for f in files if f.startswith("embed_") and f.endswith(".py")]
    
    with open(SCRIPT_PATH, "w", encoding="utf-8") as f:
        f.write("#!/bin/bash\n\n")
        f.write("set -a\nsource backend/.env\nset +a\n\n")
        f.write("export PYTHONPATH=backend\n\n")
        
        for file in embed_files:
            module_path = file.replace(".py", "")
            f.write(f"echo '{file} 실행 중...'\n")
            f.write(f"python -m app.nlp.embedding.{module_path}\n\n")
        f.write("echo '모든 임베딩 완료!'\n")
        
    os.chmod(SCRIPT_PATH, 0o755)
    print(f"run_all.sh 파일 생성 완료! ({SCRIPT_PATH})")

if __name__ == "__main__":
    main()