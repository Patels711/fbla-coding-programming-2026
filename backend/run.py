from app.__init__ import create_app
import os
from dotenv import load_dotenv

load_dotenv()
load_dotenv('.env.local', override=True)

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv('PORT', 5174))
    app.run(host='0.0.0.0', port=port, debug=True)
