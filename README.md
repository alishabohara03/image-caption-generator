# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Caption Generation Backend

## Setup
1. Install dependencies: `pip install -r requirements.txt`
2. Set up PostgreSQL database
3. Configure environment variables in `.env`
4. Place your `model.h5` and `tokenizer.pkl` in `models/` directory
5. Run: `uvicorn app.main:app --reload`

## API Endpoints
- POST /auth/signup - Register user
- POST /auth/login - Login user
- POST /caption/upload - Upload image and generate caption
- GET /history/recent - Get last 3 captions (auth required)
- GET /history/all - Get paginated history (auth required)
