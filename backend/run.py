from app.__init__ import create_app
import os
from dotenv import load_dotenv

load_dotenv()
load_dotenv('.env.local', override=True)

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv('PORT', 5174))
    if os.path.exists('.env.local'):
        with open('.env.local', 'r') as f:
            content = f.read().strip()
            if content.isdigit():
                port = int(content)
    app.run(host='0.0.0.0', port=port, debug=True)
